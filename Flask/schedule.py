from flask import Flask
from apscheduler.schedulers.background import BackgroundScheduler
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

def scheduled_job():
    logging.info("Scheduled job is executed.")

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_job, 'interval', minutes=1)
scheduler.start()

@app.route('/')
def index():
    return "Hello, the scheduler is running!"

if __name__ == '__main__':
    app.run(use_reloader=False)  # 关闭 reloader 以避免冲突
