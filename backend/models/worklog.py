# backend/models/worklog.py
from database.db import db
from datetime import datetime


class WorkLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assistant_id = db.Column(db.Integer, db.ForeignKey(
        "assistant.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    work_hours = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "assistant_id": self.assistant_id,
            "date": self.date.strftime("%Y-%m-%d"),
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
            "work_hours": self.work_hours
        }
