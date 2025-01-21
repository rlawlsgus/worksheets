# backend/routes/worklog_routes.py
from flask import Blueprint, request, jsonify
from models.worklog import WorkLog
from utils.time_calculator import calculate_work_hours
from database.db import db
from datetime import datetime

worklog_bp = Blueprint('worklog', __name__)


@worklog_bp.route('/api/worklog', methods=['POST'])
def add_worklog():
    data = request.json
    work_hours = calculate_work_hours(data['start_time'], data['end_time'])
    start_datetime = datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M')
    end_datetime = datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M')

    worklog = WorkLog(
        assistant_id=data['assistant_id'],
        date=start_datetime.date(),
        start_time=start_datetime.time(),
        end_time=end_datetime.time(),
        work_hours=work_hours
    )
    db.session.add(worklog)
    db.session.commit()
    return jsonify({'success': True, 'id': worklog.id})
