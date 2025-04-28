# backend/routes/assistant_routes.py
from flask import Blueprint, request, jsonify, render_template
from models.assistant import Assistant
from routes.auth_routes import (
    is_admin,
    get_current_user_id,
    admin_required,
    session_clear,
)
from database.db import db

assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.route("/profile/edit", methods=["GET"])
def edit_profile():
    id = request.args.get("id")
    if not id:
        return "ID가 필요합니다.", 400

    if not is_admin() and int(id) != get_current_user_id():
        return "접근 권한이 없습니다.", 403

    return render_template("profile_edit.html")


@assistant_bp.route("/admin/profile/edit", methods=["GET"])
def admin_edit_profile():
    if not is_admin():
        return "접근 권한이 없습니다.", 403

    return render_template("admin_profile_edit.html")


@assistant_bp.route("/admin/assistant/add", methods=["GET"])
def admin_add_assistant():
    if not is_admin():
        return "접근 권한이 없습니다.", 403

    return render_template("add_user.html")


@assistant_bp.route("/api/assistant", methods=["POST"])
@admin_required
def add_assistant():
    data = request.json
    assistant = Assistant(
        name=data["name"],
        is_admin=data["is_admin"],
        bank_account=data["bank_account"],
        salary=data["salary"],
        subject=data["subject"],
    )

    existing_assistant = Assistant.query.filter_by(name=data["name"]).first()
    if existing_assistant:
        return jsonify({"error": "An assistant with this name already exists."}), 400

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

    existing_assistant = Assistant.query.filter(
        Assistant.id != id, Assistant.name == data["name"]
    ).first()
    if existing_assistant:
        return jsonify({"error": "An assistant with this name already exists."}), 400

    if is_admin():
        assistant.name = data.get("name", assistant.name)
        assistant.bank_account = data.get("bank_account", assistant.bank_account)
        assistant.salary = data.get("salary", assistant.salary)
        assistant.subject = data.get("subject", assistant.subject)
    if "password" in data:
        assistant.set_password(data.get("password", assistant.password_hash))

    db.session.commit()
    return jsonify({"success": True})


@assistant_bp.route("/api/assistant/<int:id>", methods=["DELETE"])
@admin_required
def delete_assistant(id):
    assistant = Assistant.query.get_or_404(id)
    db.session.delete(assistant)
    db.session.commit()
    if assistant.is_admin:
        session_clear()
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
