# backend/app.py
from flask import Flask
from flask_cors import CORS
from database.db import db
from routes.assistant_routes import assistant_bp
from routes.worklog_routes import worklog_bp
from routes.main_routes import main_bp
import os


def create_app():
    app = Flask(__name__,
                static_folder="../frontend/static",
                template_folder="../frontend/templates")

    # 설정
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///assistants.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # 데이터베이스 초기화
    db.init_app(app)

    # 블루프린트 등록
    app.register_blueprint(main_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(worklog_bp)

    # 데이터베이스 생성
    with app.app_context():
        db.create_all()

    CORS(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
