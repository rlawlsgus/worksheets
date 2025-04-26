# backend/routes/assistant_routes.py
from flask import Blueprint, request, jsonify, render_template
from models.assistant import Assistant
from routes.auth_routes import is_admin, get_current_user_id, admin_required
from database.db import db

assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.route("/profile/edit", methods=["GET"])
def edit_profile():
    # URL에서 ID 가져오기
    id = request.args.get("id")

    if not id:
        return "ID가 필요합니다.", 400

    # 사용자 권한 확인
    if not is_admin() and int(id) != get_current_user_id():
        return "접근 권한이 없습니다.", 403

    # 일반 사용자 프로필 수정 페이지 렌더링
    return render_template("profile_edit.html")


@assistant_bp.route("/admin/profile/edit", methods=["GET"])
def admin_edit_profile():
    # 어드민 권한 확인
    if not is_admin():
        return "어드민만 접근할 수 있습니다.", 403

    # 어드민 프로필 수정 페이지 렌더링
    return render_template("admin_profile_edit.html")


@assistant_bp.route("/api/assistant", methods=["POST"])
@admin_required
def add_assistant():
    data = request.json
    assistant = Assistant(
        name=data["name"],
        bank_account=data["bank_account"],
        salary=data["salary"],
        subject=data["subject"],
    )

    assistant.set_password(data["password"])
    db.session.add(assistant)
    db.session.commit()
    return jsonify({"success": True, "id": assistant.id})


@assistant_bp.route("/api/assistant/<int:id>", methods=["PUT"])
def update_assistant(id):
    if not is_admin() and id != get_current_user_id():
        return jsonify({"message": "Forbidden"}), 403

    assistant = Assistant.query.get_or_404(id)
    data = request.json

    if is_admin():
        assistant.name = data.get("name", assistant.name)
        assistant.bank_account = data.get("bank_account", assistant.bank_account)
        assistant.salary = data.get("salary", assistant.salary)
        assistant.subject = data.get("subject", assistant.subject)
    if "password" in data:
        assistant.set_password(data.get("password", assistant.password_hash))

    db.session.commit()
    return jsonify({"success": True})


@assistant_bp.route("/api/assistant", methods=["GET"])
def get_assistants():
    if is_admin():
        assistants = Assistant.query.filter_by(is_admin=False).all()
    else:
        assistants = Assistant.query.filter_by(id=get_current_user_id()).all()
    return jsonify(
        [
            {"id": assistant.id, "name": assistant.name, "subject": assistant.subject}
            for assistant in assistants
        ]
    )


@assistant_bp.route("/api/assistant/<int:id>", methods=["GET"])
def get_assistant(id):
    if not is_admin() and id != get_current_user_id():
        return jsonify({"message": "Forbidden"}), 403

    assistant = Assistant.query.get_or_404(id)

    return jsonify(
        {
            "id": assistant.id,
            "name": assistant.name,
            "bank_account": assistant.bank_account,
            "salary": assistant.salary,
            "subject": assistant.subject,
        }
    )
