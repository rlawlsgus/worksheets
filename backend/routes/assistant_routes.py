# backend/routes/assistant_routes.py
from flask import Blueprint, request, jsonify
from models.assistant import Assistant
from database.db import db

assistant_bp = Blueprint('assistant', __name__)


@assistant_bp.route('/api/assistant', methods=['POST'])
def add_assistant():
    data = request.json
    assistant = Assistant(
        name=data['name'],
        bank_account=data['bank_account'],
        subject=data['subject']
    )
    db.session.add(assistant)
    db.session.commit()
    return jsonify({'success': True, 'id': assistant.id})


@assistant_bp.route('/api/assistant/<int:id>', methods=['PUT'])
def update_assistant(id):
    assistant = Assistant.query.get_or_404(id)
    data = request.json
    assistant.name = data.get('name', assistant.name)
    assistant.bank_account = data.get('bank_account', assistant.bank_account)
    assistant.subject = data.get('subject', assistant.subject)
    db.session.commit()
    return jsonify({'success': True})
