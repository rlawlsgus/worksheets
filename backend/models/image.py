# backend/models/image.py
from database.db import db
from datetime import datetime


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assistant_id = db.Column(db.Integer, db.ForeignKey("assistant.id"), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    date = db.Column(db.DateTime, default=datetime.now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "assistant_id": self.assistant_id,
            "url": self.url,
            "filename": self.filename,
            "date": self.date.strftime("%Y-%m-%d"),
        }
