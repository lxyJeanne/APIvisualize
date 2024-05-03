from app import app, db, update_all_events  # 确保从你的 Flask 应用模块导入这些依赖

def test_update_all_events():
    # 创建一个应用上下文
    with app.app_context():
        # 确保数据库已经准备就绪
        db.create_all()

        # 调用 update_all_events 函数
        try:
            result = update_all_events()
            print("Function executed successfully:", result)
        except Exception as e:
            print("Error occurred:", str(e))

if __name__ == "__main__":
    test_update_all_events()
