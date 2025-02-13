# routes/auth_routes.py
from flask import Blueprint, request, session, redirect, url_for, render_template, jsonify
from models.assistant import Assistant

auth_bp = Blueprint("auth", __name__)

def check_login():
    # API 엔드포인트 체크
    if request.path.startswith('/api/'):
        if "user_id" not in session:
            return jsonify({'error': 'Unauthorized'}), 401
    # 일반 페이지 체크
    elif "user_id" not in session and request.endpoint != "auth.login":
        return redirect(url_for("auth.login"))

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.json
        username = data["username"]
        password = data["password"]
        
        user = Assistant.query.filter_by(name=username).first()
        if user and user.check_password(password):
            print("User logged in:", user)
            session.permanent = True
            session["user_id"] = user.id
            session.modified = True
            return jsonify({"success": True, "redirect": url_for("main.home")})
            
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    
    return render_template("login.html")

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"success": True, "redirect": url_for("auth.login")})