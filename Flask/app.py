import json
from flask import Flask, jsonify, render_template, request,  send_from_directory
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
from sqlalchemy import DateTime
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from flask_caching import Cache
import os

def setup_scheduler():
    # logging.basicConfig(level=logging.INFO)
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=update_all_events, trigger="interval", seconds=30)
    scheduler.start()

app = Flask(__name__)
CORS(app)       # 允许跨域请求
cache = Cache(app, config={'CACHE_TYPE': 'simple'})  # 设置缓存类型为 simple
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
    enable_log = db.Column(db.Boolean, default=False)
    start_time = db.Column(DateTime(timezone=True), nullable=True)


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

    device_number = db.Column(db.String(50), nullable=True)
    zone = db.Column(db.String(50), nullable=True)
    zone_name = db.Column(db.String(50), nullable=True) #新增字段
    system = db.Column(db.String(120), nullable=True)
    system_name = db.Column(db.String(120), nullable=True) #新增字段
    user_name = db.Column(db.String(120), nullable=True)
    event_code = db.Column(db.Integer, nullable=True)
    picture_url = db.Column(db.String(255), nullable=True)


@app.route('/')
def page_login():
    return render_template('login.html', method=request.method)

@app.route('/submit', methods=['POST'])
def submit():
    return authenticate_user()

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
        'password': user.password,
        'enable_log': user.enable_log.__str__(),
        'start_time': user.start_time.isoformat() if user.start_time else None
    } for user in users]
    return json.dumps(user_list), 200, {'ContentType': 'application/json'}

def format_time(time_str):
    """将时间字符串中的 'T' 替换为空格"""
    return time_str.replace('T', ' ')

@app.route('/alarms',methods=['GET'])
@cache.cached(timeout=50)  # 缓存50秒
def list_alarm():
    events = Event.query.all()
    events_list = [{
        'app_key': event.app_key,
        'device_serial': event.device_serial,
        'event_type': event.event_type,
        'description': event.description,
        'trigger_time': format_time(event.trigger_time.isoformat()),
        'channel_name': event.channel_name,
        'detection_target': event.detection_target,
        'target_position': event.target_position,

        'device_number': event.device_number,
        'zone': event.zone,
        'zone_name': event.zone_name,
        'system': event.system,
        'system_name': event.system_name,
        'user_name': event.user_name,
        'event_code': event.event_code,
        'picture_url': event.picture_url     
    } for event in events]
    return json.dumps(events_list), 200, {'ContentType': 'application/json'}

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

@app.route('/fetch-data/<appKey>')
def fetch_user_data(appKey):
    user = User.query.filter_by(username=appKey).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # 假设 fetch_data 是一个外部函数
    response = fetch_data(user.username, user.password, user.token)
    if response.ok:
        data_list = response.json().get('data', {}).get('list', [])
        
        # 存储数据到数据库
        parse_and_store_data(data_list, user.username)
        print(f"Data 成功 fetched for {appKey}")
        return jsonify(response.json())  # 确保返回 JSON 格式的数据
    else:
        return jsonify({"error": "Failed to fetch data"}), response.status_code


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
    
    # 处理命名空间
    ns = {'ns': 'http://www.isapi.org/ver20/XMLSchema'}
    
    # 使用字典的 get 方法尝试获取命名空间元素
    device_serial = root.findtext('.//ns:deviceSerial', namespaces=ns) or root.findtext('.//deviceSerial')
    event_type = root.findtext('.//ns:eventType', namespaces=ns) or root.findtext('.//eventType')
    description = root.findtext('.//ns:eventDescription', namespaces=ns) or root.findtext('.//eventDescription')
    trigger_time_str = root.findtext('.//ns:triggerTime', namespaces=ns) or root.findtext('.//triggerTime')
    channel_name = root.findtext('.//ns:channelName', namespaces=ns) or root.findtext('.//channelName')
    
    # 检查 DetectionRegionEntry 的存在
    detection_entry = root.find('.//ns:DetectionRegionEntry', namespaces=ns) or root.find('.//DetectionRegionEntry')
    detection_target = ''
    if detection_entry is not None:
        detection_target = detection_entry.findtext('ns:detectionTarget', namespaces=ns) or detection_entry.findtext('detectionTarget')
    
    # 检查 TargetRect 的存在
    target_position = ''
    if detection_entry is not None:
        target_rect = detection_entry.find('ns:TargetRect', namespaces=ns) or detection_entry.find('TargetRect')
        if target_rect is not None:
            x = target_rect.findtext('ns:X', namespaces=ns) or target_rect.findtext('X')
            y = target_rect.findtext('ns:Y', namespaces=ns) or target_rect.findtext('Y')
            width = target_rect.findtext('ns:width', namespaces=ns) or target_rect.findtext('width')
            height = target_rect.findtext('ns:height', namespaces=ns) or target_rect.findtext('height')
            target_position = f"{x},{y},{width},{height}"
    
    # 检查 pictureList 的存在
    picture_urls = [url_elem.text for url_elem in root.findall('.//ns:pictureList/ns:url', namespaces=ns)] or \
                   [url_elem.text for url_elem in root.findall('.//pictureList/url')]
    picture_url_str = ','.join(picture_urls) if picture_urls else ''
    
    # 验证所有关键字段
    if not device_serial or not trigger_time_str:
        raise ValueError("Missing required fields in XML data")

    data = {
        'device_serial': device_serial,
        'event_type': event_type,
        'description': description,
        'trigger_time': datetime.fromisoformat(trigger_time_str),
        'channel_name': channel_name,
        'detection_target': detection_target,
        'target_position': target_position,
        'device_number': '',    # JSON 
        'zone': '',
        'zone_name': '',
        'system': '',
        'system_name': '',
        'user_name': '',
        'event_code': '',
        'picture_url': picture_url_str
    }
    return data

def parse_json(json_data):
    try:
        # 解析 JSON 数据
        event = json.loads(json_data)

        # 直接访问 CIDEvent 对象，不需要额外的 json.loads
        cid_event = event.get('CIDEvent', {})

        # 提取 eventDescription
        event_description = event.get('eventDescription', '')

        # 根据 eventDescription 提取 trigger_time
        if event_description == 'Linkage':
            # 如果 eventDescription 为 Linkage，从 pictureList 中提取 trigger_time
            picture_list = event.get('pictureList', [])
            if picture_list:
                trigger_time_str = picture_list[0].get('triggerTime', '')
            else:
                trigger_time_str = ''
        else:
            # 否则，从主事件对象中提取 trigger_time
            trigger_time_str = event.get('triggerTime') or event.get('dateTime', '')

        if trigger_time_str:
            trigger_time = datetime.fromisoformat(trigger_time_str)
        else:
            trigger_time = None  # Handle cases where neither is provided

        # 提取 pictureList 链接
        picture_urls = []
        picture_list = event.get('pictureList', [])
        for picture in picture_list:
            url = picture.get('url')
            if url:
                picture_urls.append(url)

        # 将所有链接拼接成一个字符串，使用逗号分隔
        picture_url_str = ','.join(picture_urls)

        return {
            'device_serial': event.get('deviceSerial', ''),
            'event_type': event.get('eventType', ''),
            'description': cid_event.get('description', event_description),
            'trigger_time': trigger_time,
            'channel_name': event.get('channelName', ''),
            'detection_target': cid_event.get('detectionTarget', ''),
            'target_position': '',

            'device_number': cid_event.get('deviceNo', ''), 
            'zone': cid_event.get('zone', ''),
            'zone_name': cid_event.get('zoneName', ''),  
            'system': cid_event.get('system', ''),
            'system_name': cid_event.get('systemName', ''), 
            'user_name': cid_event.get('userName', ''),
            'event_code': cid_event.get('code', ''),
            'picture_url': picture_url_str  # 保存拼接后的链接字符串
        }
    except json.JSONDecodeError:
        return None

@app.route('/writeLog', methods=['POST'])
def write_log():
    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not user.enable_log:
        user.enable_log = True
        if not user.start_time:
            user.start_time = datetime.now(timezone.utc)
            db.session.commit()

            log_filename = f'logs/{username}_{user.start_time.strftime("%Y%m%d%H%M%S")}_log.txt'
            if not os.path.exists('logs'):
                os.makedirs('logs')
            open(log_filename, 'w').close()  # 创建一个空文件
        db.session.commit()
        return jsonify({"message": "Log started"}), 200
    else:
        return jsonify({"message": "Log is already enabled"}), 400

@app.route('/stopLog', methods=['POST'])
def stop_log():
    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.enable_log = False
    db.session.commit()

    return jsonify({"message": "Log stopped"}), 200

def parse_and_store_data(data_list, app_key):
    user = User.query.filter_by(username=app_key).first()
    if not user:
        return  # 如果用户不存在，跳过
    
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

        # 检查事件是否已存在于数据库中
        if not event_exists(parsed_data):
            # 将解析后的数据添加到数据库
            event = Event(**parsed_data)
            db.session.add(event)
            db.session.commit()  # 确保添加到数据库

            # 如果用户启用了日志记录，则将数据写入日志文件
            if user.enable_log:
                log_filename = f'logs/{app_key}_{user.start_time.strftime("%Y%m%d%H%M%S")}_log.txt'
                save_data_to_txt(data_item, log_filename)

def event_exists(parsed_data):
    # 检查相同的 device_serial, trigger_time 和 event_type 是否已存在
    return Event.query.filter_by(
        device_serial=parsed_data['device_serial'],
        event_type=parsed_data['event_type'],
        trigger_time=parsed_data['trigger_time']
    ).first() is not None

def save_data_to_txt(data, filename):
    """将原始数据保存到文本文件"""
    with open(filename, "a") as f:
        json.dump(data, f)
        f.write('\n')

@app.route('/download', methods=['POST'])
def download_file():
    data = request.get_json()
    username = data.get('username')  # 确保这里的参数名和前端一致

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not user.start_time:
        return jsonify({"message": "Logging not started for this user"}), 400

    log_filename = f'{user.username}_{user.start_time.strftime("%Y%m%d%H%M%S")}_log.txt'
    
    try:
        return send_from_directory('logs', log_filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"message": "Log file not found"}), 404
    

@app.route('/deleteLog', methods=['POST'])
def delete_log():
    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    log_filename = f'logs/{username}_{user.start_time.strftime("%Y%m%d%H%M%S")}_log.txt'
    try:
        os.remove(log_filename)
        user.enable_log = False
        user.start_time = None
        db.session.commit()
        return jsonify({"message": "Log deleted"}), 200
    except FileNotFoundError:
        return jsonify({"message": "Log file not found"}), 404

@app.route('/clear', methods=['POST'])
def clear():
    data = request.get_json()  # Parse JSON data from the request

    if data['data'] == "all":
        # Clear all data if "all" is received
        db.drop_all()
        db.create_all()
        return jsonify(message="All data cleared"), 200
    else:
        app_key = data['data']
        # Clear specific entries in the Event and User tables
        Event.query.filter_by(app_key=app_key).delete()
        User.query.filter_by(username=app_key).delete()
        db.session.commit()
        return jsonify(message=f"Data for {app_key} cleared"), 200

@app.route('/update-all-events')
def update_all_events():
    with app.app_context():  # 创建一个应用上下文
        users = User.query.all()
        for user in users:
            # logging.info(f"Updating events for user: {user.username}")
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
                parse_and_store_data(data_list,  user.username)  # 传入 app_key        
            else:
                continue  # 获取数据失败，跳过当前用户

        # logging.info(f"Update results: {results}")
        return "All events updated", 200


# 在应用启动时调用定时器设置
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # 创建所有数据库表 
        setup_scheduler()
        app.run(host='0.0.0.0', port=5000,use_reloader=False) # 关闭 reloader 以避免冲突


