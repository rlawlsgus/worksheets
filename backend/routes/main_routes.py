# backend/routes/main_routes.py
from flask import Blueprint, render_template
from models.assistant import Assistant

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def home():
    assistants = Assistant.query.all()
    return render_template("home.html", assistants=assistants)
