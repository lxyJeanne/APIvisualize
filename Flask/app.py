import json
from flask import Flask, jsonify, render_template, request, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
from sqlalchemy import DateTime
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import logging

def setup_scheduler():
    logging.basicConfig(level=logging.INFO)
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=update_all_events, trigger="interval", minutes=1)
    scheduler.start()

app = Flask(__name__)
CORS(app)       # 允许跨域请求
# Ensure the SECRET_KEY is set to a secure, random value when deploying.
app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a real secret key.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    token = db.Column(db.String(255), nullable=True)  
    # 确保 token_expiry 字段可以存储时区信息
    token_expiry = db.Column(DateTime(timezone=True), nullable=True)
    print("User table created")

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    app_key = db.Column(db.String(120), nullable=True)  # 映射到 User 表的 username 字段
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
    print("Event table created")

@app.route('/')
def page_login():
    return render_template('login.html', method=request.method)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()  # 获取 JSON 数据
        username = data['appkey']
        password = data['secretkey']
        action = data('action', 'login')    # 获取 action 参数
        
        # 如果 action 为 delete，则删除用户
        if action == 'delete':
            user = User.query.filter_by(username=username, password=password).first()
            if user:
                db.session.delete(user)
                db.session.commit()
                return "User deleted successfully"
            else:
                return "User not found", 404
        # 否则，尝试获取 token
        if not username or not password:
            return "Username and password are required", 400
        if User.query.filter_by(username=username).first():
            return "Username already exists", 400
        
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        # 尝试获取 token
        token_response = get_token(username, password)
        if token_response.ok:
            json_response = token_response.json()
            if json_response.get('errorCode') == "0" and json_response.get('data'):
                new_user.token = json_response['data']['accessToken']

                # 处理时间戳
                timestamp_ms = json_response['data'].get('expireTime')
                if timestamp_ms:
                    expire_time = datetime.fromtimestamp(timestamp_ms / 1000.0, timezone.utc)
                    new_user.token_expiry = expire_time
                db.session.commit()
                return "User registered with token"
            else:
                # 获取 token 失败，删除添加的用户
                db.session.delete(new_user)
                db.session.commit()
                return f"Failed to get token: {json_response.get('errorCode')}", 500
        else:
            # 通信失败，删除添加的用户
            db.session.delete(new_user)
            db.session.commit()
            return "Failed to communicate with token service", 500
            #应当确保已经在 db.session.add(new_user) 后执行了 db.session.commit()
            #因为只有提交后，才能确保数据库中已存在该记录，从而可以被删除。
    else:
        return redirect(url_for('page_login'))

@app.route('/submit', methods=['POST'])
def submit():
    return authenticate_user()

@app.route('/delete', methods=['POST'])
def delete_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')  # 注意安全性，实际应用中可能需要更安全的验证方式

    user = User.query.filter_by(username=username, password=password).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    else:
        return jsonify({"message": "User not found"}), 404

def authenticate_user():
    data = request.get_json()  # 获取 JSON 数据
    username = data.get('appkey')
    password = data.get('secretkey')
    
    # 检查用户名和密码是否提供
    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Username and password are required'}), 400

    # 检查用户是否已存在
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({'status': 'error', 'message': 'Username already exists'}), 400
    
    # 为新用户创建记录
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    # 尝试获取 token
    token_response = get_token(username, password)
    if token_response.ok:
        json_response = token_response.json()
        if json_response.get('errorCode') == "0" and json_response.get('data'):
            new_user.token = json_response['data']['accessToken']
            timestamp_ms = json_response['data'].get('expireTime')
            if timestamp_ms:
                new_user.token_expiry = datetime.fromtimestamp(timestamp_ms / 1000.0, timezone.utc)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'User registered with token'}), 200
        else:
            db.session.delete(new_user)
            db.session.commit()
            return jsonify({'status': 'error', 'message': f"Failed to get token: {json_response.get('errorCode')}"}), 500
    else:
        db.session.delete(new_user)
        db.session.commit()
        return jsonify({'status': 'error', 'message': 'Failed to communicate with token service'}), 500


@app.route('/users',methods=['GET'])
def list_users():
    users = User.query.all()
    user_list = [{
        'id': user.id,
        'username': user.username,
        'password': user.password  # Be cautious about sending passwords in responses; consider security implications.
    } for user in users]
    print(user_list)
    return json.dumps(user_list), 200, {'ContentType': 'application/json'}


def get_token(username, password):
    url = "https://api.hik-partner.com/api/hpcgw/v1/token/get"
    headers = {'Content-Type': 'application/json'}
    data = {
        "appKey": username,
        "secretKey": password
    }
    return requests.post(url, json=data, headers=headers)

def fetch_data(username, password, token):
    url = "https://api.hik-partner.com/api/hpcgw/v1/mq/messages"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        "appKey": username,
        "secretKey": password
    }
    response = requests.post(url, json=data, headers=headers)
    return response


@app.route('/fetch-data/<int:user_id>')
def fetch_user_data(user_id):
    user = User.query.get(user_id)
    if not user:
        return "User not found", 404

    if not is_token_valid(user):
        # Token 过期或无效，重新获取并更新
        token_response = get_token(user.username, user.password)
        if token_response.ok:
            json_response = token_response.json()
            if json_response.get('errorCode') == "0" and json_response.get('data'):
                user.token = json_response['data']['accessToken']
                expire_time = datetime.fromtimestamp(json_response['data']['expireTime'] / 1000.0, timezone.utc)
                user.token_expiry = expire_time
                db.session.commit()
            else:
                return f"Failed to renew token: {json_response.get('errorCode')}", 500
        else:
            return "Failed to communicate with token service for renewal", 500

    # Token 是有效的，获取数据
    response = fetch_data(user.username, user.password, user.token)
    if response.ok:
        data_list = response.json()['data']['list']
        parse_and_store_data(data_list, user_id, user.username)
        # return f"Data fetched and stored for user {user_id}"
        return response.json() #根据 API 返回的数据格式
    else:
        return "Failed to fetch data", response.status_code


def is_token_valid(user):
    if user.token_expiry:
        # 确保 user.token_expiry 是带时区信息的
        if user.token_expiry.tzinfo is None:
            # 如果没有时区信息，添加 UTC 时区
            user.token_expiry = user.token_expiry.replace(tzinfo=timezone.utc)
        if user.token_expiry > datetime.now(timezone.utc):
            return True
    return False


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
    try:
        # 解析 JSON 数据
        event = json.loads(json_data)
        print("Complete Event Data:", event)

        # 直接访问 CIDEvent 对象，不需要额外的 json.loads
        cid_event = event.get('CIDEvent', {})
        print("CID Event Data:", cid_event)
    
        # 尝试从 JSON 中提取 trigger_time 并转换为 datetime 对象
        trigger_time_str = event.get('triggerTime', '')
        trigger_time = datetime.fromisoformat(trigger_time_str) if trigger_time_str else None

        return {
            'device_serial': event.get('deviceSerial', ''),
            'event_type': event.get('eventType', ''),
            'description': cid_event.get('description', ''),
            'trigger_time': trigger_time,
            'channel_name': event.get('channelName', ''),
            'detection_target': cid_event.get('detectionTarget', ''),
            'target_position': '',
            'zone': cid_event.get('zone', ''),
            'system_name': cid_event.get('systemName', ''),
            'user_name': cid_event.get('userName', ''),
            'event_code': cid_event.get('code', None),
            'picture_url': event.get('pictureURL', '')
        }
    except json.JSONDecodeError:
        print("Error decoding JSON")
        return None

def parse_and_store_data(data_list, user_id, app_key):
    for data_item in data_list:
        format_type = data_item['formatType']
        alarm_data = data_item['alarmData']
        if format_type == 'XML':
            parsed_data = parse_xml(alarm_data)
        elif format_type == 'JSON':
            parsed_data = parse_json(alarm_data)
        else:
            continue  # 如果数据格式既不是 XML 也不是 JSON，则跳过
        parsed_data['app_key'] = app_key  # 将 username 添加到解析的数据中

        # 检查事件是否已存在        
        if event_exists(parsed_data):
            continue  # 如果已存在，跳过此条目

        # 将解析后的数据添加到数据库
        event = Event(**parsed_data)
        db.session.add(event)
    db.session.commit()

def event_exists(parsed_data):
    # 检查相同的 device_serial, trigger_time 和 event_type 是否已存在
    return Event.query.filter_by(
        device_serial=parsed_data['device_serial'],
        event_type=parsed_data['event_type'],
        trigger_time=parsed_data['trigger_time']
    ).first() is not None

@app.route('/update-all-events')
def update_all_events():
    with app.app_context():  # 创建一个应用上下文
        users = User.query.all()
        results={}
        for user in users:
            logging.info(f"Updating events for user: {user.username}")
            if not is_token_valid(user):
                token_response = get_token(user.username, user.password)
                if token_response.ok:
                    json_response = token_response.json()
                    if json_response.get('errorCode') == "0" and json_response.get('data'):
                        user.token = json_response['data']['accessToken']
                        expire_time = datetime.fromtimestamp(json_response['data']['expireTime'] / 1000.0, timezone.utc)
                        user.token_expiry = expire_time
                        db.session.commit()
                    else:
                        continue  # 如果无法获取新 token，跳过当前用户
                else:
                    continue  # 通信失败，跳过当前用户

            # 获取数据
            response = fetch_data(user.username, user.password, user.token)
            if response.ok:
                data_list = response.json().get('data', {}).get('list', [])
                parse_and_store_data(data_list, user.id, user.username)  # 传入 app_key
                results[user.id] = "Events updated"
            else:
                continue  # 获取数据失败，跳过当前用户

        logging.info(f"Update results: {results}")
        return "All events updated", 200


# 在应用启动时调用定时器设置
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # 创建所有数据库表
        print("Database tables created")  # 确保数据库表已创建  
        setup_scheduler()
        print("Scheduler started")  # 确保定时器已启动
        app.run(host='0.0.0.0', port=5000,use_reloader=False) # 关闭 reloader 以避免冲突


