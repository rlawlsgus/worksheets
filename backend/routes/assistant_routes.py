# backend/routes/assistant_routes.py
from flask import Blueprint, request, jsonify
from models.assistant import Assistant
from routes.auth_routes import is_admin, get_current_user_id, admin_required
from database.db import db

assistant_bp = Blueprint("assistant", __name__)


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
    assistant = Assistant.query.get_or_404(id)
    data = request.json

    if is_admin():
        assistant.name = data.get("name", assistant.name)
        assistant.bank_account = data.get("bank_account", assistant.bank_account)
        assistant.salary = data.get("salary", assistant.salary)
        assistant.subject = data.get("subject", assistant.subject)

    assistant.set_password(data.get("password", assistant.password_hash))
    db.session.commit()
    return jsonify({"success": True})


@assistant_bp.route("/api/assistant", methods=["GET"])
def get_assistants():
    if is_admin():
        assistants = Assistant.query.all()
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
