# backend/models/assistant.py
from database.db import db


class Assistant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bank_account = db.Column(db.String(100))
    salary = db.Column(db.Integer)
    subject = db.Column(db.String(50))
    work_logs = db.relationship("WorkLog", backref="assistant", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "bank_account": self.bank_account,
            "salary": self.salary,
            "subject": self.subject
        }
