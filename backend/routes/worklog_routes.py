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


@worklog_bp.route('/api/worklogs/<int:assistant_id>/<int:year>/<int:month>', methods=['GET'])
def get_monthly_worklogs(assistant_id, year, month):
    worklogs = WorkLog.query.filter(
        WorkLog.assistant_id == assistant_id,
        db.extract('year', WorkLog.date) == year,
        db.extract('month', WorkLog.date) == month
    ).order_by(WorkLog.date).all()

    return jsonify([{
        'id': log.id,
        'date': log.date.strftime('%Y-%m-%d'),
        'start_time': log.start_time.strftime('%H:%M'),
        'end_time': log.end_time.strftime('%H:%M'),
        'work_hours': log.work_hours
    } for log in worklogs])


@worklog_bp.route('/api/worklog/<int:id>', methods=['DELETE'])
def delete_worklog(id):
    worklog = WorkLog.query.get_or_404(id)
    db.session.delete(worklog)
    db.session.commit()
    return jsonify({'success': True})
