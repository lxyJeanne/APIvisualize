from flask import Flask, render_template, request, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)
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
    token = db.Column(db.String(255), nullable=True)  # 新增 token 字段
    print("User table created")

@app.route('/')
def page_login():
    return render_template('login.html', method=request.method)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
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
    else:
        return redirect(url_for('page_login'))

@app.route('/users')
def list_users():
    users = User.query.all()
    return render_template('users.html', users=users)


def get_token(username, password):
    url = "https://api.hik-partner.com/api/hpcgw/v1/token/get"
    headers = {'Content-Type': 'application/json'}
    data = {
        "appKey": username,
        "secretKey": password
    }
    return requests.post(url, json=data, headers=headers)

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)

