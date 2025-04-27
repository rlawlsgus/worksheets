# routes/auth_routes.py
from flask import (
    Blueprint,
    request,
    session,
    redirect,
    url_for,
    render_template,
    jsonify,
)
from functools import wraps
from models.assistant import Assistant

auth_bp = Blueprint("auth", __name__)


def is_admin():
    return session.get("is_admin", False)


def get_current_user_id():
    return session.get("user_id")


def check_login():
    # API 엔드포인트 체크
    if request.path.startswith("/api/"):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
    # 일반 페이지 체크
    elif "user_id" not in session and request.endpoint != "auth.login":
        return redirect(url_for("auth.login"))


@auth_bp.route("/api/auth/check", methods=["GET"])
def check_auth():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"authenticated": False}), 401

    return jsonify({"authenticated": True, "user_id": user_id, "is_admin": is_admin()})


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "is_admin" not in session or not is_admin():
            return jsonify({"message": "Forbidden"}), 403

        return f(*args, **kwargs)

    return decorated_function


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.json
        username = data["username"]
        password = data["password"]

        user = Assistant.query.filter_by(name=username).first()
        if user and user.check_password(password):
            session.clear()
            session.permanent = True
            session["user_id"] = user.id
            session["is_admin"] = bool(user.is_admin)
            session.modified = True
            return jsonify({"success": True, "redirect": url_for("main.home")})

        return jsonify({"success": False, "error": "Invalid credentials"})

    return render_template("login.html")


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "redirect": url_for("auth.login")})


@auth_bp.route("/api/is_admin", methods=["GET"])
def send_is_admin():
    return jsonify({"is_admin": is_admin()})


def session_clear():
    session.clear()
    return jsonify({"success": True})
