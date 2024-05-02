from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
import json


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    token = db.Column(db.String(255), nullable=True)  
    token_expiry = db.Column(db.DateTime, nullable=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_serial = db.Column(db.String(120), nullable=False)
    event_type = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    trigger_time = db.Column(db.DateTime, nullable=False)
    channel_name = db.Column(db.String(255), nullable=True)
    detection_target = db.Column(db.String(255), nullable=True)
    target_position = db.Column(db.String(255), nullable=True)
    zone = db.Column(db.String(50), nullable=True)
    system_name = db.Column(db.String(120), nullable=True)
    user_name = db.Column(db.String(120), nullable=True)
    event_code = db.Column(db.Integer, nullable=True)
    picture_url = db.Column(db.String(255), nullable=True)




def parse_xml(xml_data):
    root = ET.fromstring(xml_data)
    data = {
        'device_serial': root.findtext('.//deviceSerial'),
        'event_type': root.findtext('.//eventType'),
        'description': root.findtext('.//eventDescription'),
        'trigger_time': datetime.fromisoformat(root.findtext('.//triggerTime')),
        'channel_name': root.findtext('.//channelName'),
        'detection_target': root.find('.//DetectionRegionEntry').findtext('.//detectionTarget') if root.find('.//DetectionRegionEntry') is not None else '',
        'target_position': f"{root.findtext('.//X')},{root.findtext('.//Y')},{root.findtext('.//width')},{root.findtext('.//height')}",
        'zone': '',
        'system_name': '',
        'user_name': '',
        'event_code': None,
        'picture_url': None
    }
    return data

def parse_json(json_data):
    event = json.loads(json_data)
    return {
        'device_serial': event.get('deviceSerial', ''),
        'event_type': event.get('eventType', ''),
        'description': event.get('eventDescription', ''),
        'trigger_time': datetime.fromisoformat(event.get('triggerTime')),
        'channel_name': '',
        'detection_target': '',
        'target_position': '',
        'zone': event.get('zone', ''),
        'system_name': event.get('systemName', ''),
        'user_name': event.get('userName', ''),
        'event_code': event.get('eventCode', None),
        'picture_url': event.get('pictureList', [{}])[0].get('url', '') if event.get('pictureList') else ''
    }


@app.route('/')
def page_login():
    return render_template('login.html', method=request.method)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        action = request.form.get('action', 'login')
        
        if action == 'delete':
            user = User.query.filter_by(username=username, password=password).first()
            if user:
                db.session.delete(user)
                db.session.commit()
                return "User deleted successfully"
            return "User not found", 404
        
        if not username or not password:
            return "Username and password are required", 400
        if User.query.filter_by(username=username).first():
            return "Username already exists", 400
        
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        
        token_response = get_token(username, password)
        if token_response.ok:
            json_response = token_response.json()
            if json_response.get('errorCode') == "0" and json_response.get('data'):
                new_user.token = json_response['data']['accessToken']
                timestamp_ms = json_response['data'].get('expireTime')
                if timestamp_ms:
                    expire_time = datetime.fromtimestamp(timestamp_ms / 1000.0, timezone.utc)
                    new_user.token_expiry = expire_time
                db.session.commit()
                return "User registered with token"
            db.session.delete(new_user)
            db.session.commit()
            return f"Failed to get token: {json_response.get('errorCode')}", 500
        db.session.delete(new_user)
        db.session.commit()
        return "Failed to communicate with token service", 500
    return redirect(url_for('page_login'))

@app.route('/users')
def list_users():
    users = User.query.all()
    return render_template('users.html', users=users)

@app.route('/fetch_events')
def fetch_events():
    user = User.query.first()
    if not user:
        return "No user available", 404

    if not is_token_valid(user):
        response = get_token(user.username, user.password)
        if response.ok:
            data = response.json()
            user.token = data['data']['accessToken']
            user.token_expiry = datetime.fromtimestamp(data['data']['expireTime'] / 1000.0, timezone.utc)
            db.session.commit()
        else:
            return "Failed to refresh token", response.status_code

    headers = {'Authorization': f'Bearer {user.token}'}
    response = requests.get('https://api.hik-partner.com/api/hpcgw/v1/mq/messages', headers=headers)
    if response.ok:
        events = response.json()
        for event in events:
            event_data = parse_xml(event['alarmData']) if event['formatType'] == 'XML' else parse_json(event['alarmData'])
            new_event = Event(**event_data)
            db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Events fetched and stored successfully'})
    else:
        return jsonify({'error': 'Failed to fetch data'}), response.status_code

def get_token(username, password):
    url = "https://api.hik-partner.com/api/hpcgw/v1/token/get"
    headers = {'Content-Type': 'application/json'}
    data = {"appKey": username, "secretKey": password}
    response = requests.post(url, json=data, headers=headers)
    return response

def is_token_valid(user):
    return user.token_expiry and user.token_expiry > datetime.now(timezone.utc)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
