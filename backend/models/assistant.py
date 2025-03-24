# backend/models/assistant.py
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash


class Assistant(db.Model):
    is_admin = db.Column(db.Boolean, default=False)
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bank_account = db.Column(db.String(100))
    salary = db.Column(db.Integer)
    subject = db.Column(db.String(50))
    work_logs = db.relationship("WorkLog", backref="assistant", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "is_admin": self.is_admin,
            "id": self.id,
            "name": self.name,
            "password_hash": self.password_hash,
            "bank_account": self.bank_account,
            "salary": self.salary,
            "subject": self.subject,
        }
