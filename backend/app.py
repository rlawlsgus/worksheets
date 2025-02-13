# backend/app.py
from flask import Flask
from flask_cors import CORS
from database.db import db
from routes.assistant_routes import assistant_bp
from routes.worklog_routes import worklog_bp
from routes.main_routes import main_bp
from routes.auth_routes import auth_bp, check_login
# from models.assistant import Assistant
from datetime import timedelta
from dotenv import load_dotenv
import pymysql
import os

# def admin_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         user = Assistant.query.get(session.get("user_id"))
#         if not user or not user.is_admin:
#             return jsonify({"error": "Admin privileges required"}), 403
#         return f(*args, **kwargs)
#     return decorated_function

def create_app():
    app = Flask(__name__,
                static_folder="../frontend/static",
                template_folder="../frontend/templates")
    
    load_dotenv()

    # 설정
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_SECURE"] = True  # HTTPS 전용
    app.config["SESSION_COOKIE_HTTPONLY"] = True  # JavaScript에서 접근 불가
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"  # CSRF 보호
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

    # 데이터베이스 초기화
    db.init_app(app)

    # 블루프린트에 check_login 함수를 before_request로 등록
    for blueprint in [main_bp, assistant_bp, worklog_bp]:
        blueprint.before_request(check_login)

    # 블루프린트 등록
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(worklog_bp)

    # 데이터베이스 생성
    with app.app_context():
        db.create_all()

    CORS(app, supports_credentials=True)
    return app

app = create_app()

if __name__ == "__main__":
    app.run()
