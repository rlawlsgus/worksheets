# backend/app.py
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from backend.database.db import db
from backend.routes.assistant_routes import assistant_bp
from backend.routes.worklog_routes import worklog_bp
from backend.routes.image_routes import image_bp
from backend.routes.main_routes import main_bp
from backend.routes.auth_routes import auth_bp, check_login
from datetime import timedelta
from dotenv import load_dotenv
import os


def create_app():
    app = Flask(
        __name__,
        static_folder="../frontend/static",
        template_folder="../frontend/templates",
    )

    load_dotenv()

    # 설정
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    if os.getenv("FLASK_ENV") == "development":
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("TEST_DB")
    elif os.getenv("FLASK_ENV") == "production":
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
    Migrate(app, db)

    # 블루프린트에 check_login 함수를 before_request로 등록
    for blueprint in [main_bp, assistant_bp, worklog_bp]:
        blueprint.before_request(check_login)

    # 블루프린트 등록
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(worklog_bp)
    app.register_blueprint(image_bp)

    # 데이터베이스 생성
    # with app.app_context():
    #     db.create_all()

    CORS(app, supports_credentials=True)
    return app


app = create_app()


@app.before_request
def create_tables():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
