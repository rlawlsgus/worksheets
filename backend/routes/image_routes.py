from flask import Blueprint, render_template, request, jsonify, send_file
from backend.models.image import Image
from backend.models.assistant import Assistant
from backend.routes.auth_routes import is_admin, get_current_user_id
from backend.database.db import db
import boto3
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
from datetime import datetime
import uuid
import io

image_bp = Blueprint("image_routes", __name__)

load_dotenv()

# AWS S3 설정
S3_BUCKET = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("AWS_REGION", "ap-northeast-2")

if os.getenv("FLASK_ENV") == "development":
    s3_client = boto3.client(
        "s3",
        region_name=S3_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
elif os.getenv("FLASK_ENV") == "production":
    s3_client = boto3.client("s3", region_name=S3_REGION)

# 허용되는 파일 확장자
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_presigned_url(image):
    try:
        # 30분 동안 유효한 URL 생성
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": f"taxi_images/{image.filename}"},
            ExpiresIn=1800,  # 30분
        )
        return url
    except Exception as e:
        print(f"Error generating URL: {str(e)}")
        return None


@image_bp.route("/images/<int:assistant_id>/", methods=["GET"])
def get_images_by_assistant(assistant_id):
    try:
        user_id = get_current_user_id()
        assistant = Assistant.query.get(assistant_id)
        if not is_admin() and (not assistant or assistant.id != user_id):
            return jsonify({"error": "Unauthorized access"}), 403

        images = Image.query.filter_by(assistant_id=assistant_id).all()

        # 서명된 URL을 포함한 이미지 정보 생성
        result = []
        for image in images:
            image_data = image.to_dict()
            signed_url = generate_presigned_url(image)
            if signed_url:
                image_data["signed_url"] = signed_url
            result.append(image_data)

        return render_template(
            "images.html",
            name=assistant.name,
            assistant_id=assistant.id,
            images=result,
            today_date=datetime.today().strftime("%Y-%m-%d"),
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@image_bp.route("/api/image_upload", methods=["POST"])
def upload_image():
    try:
        if not request.content_type.startswith("multipart/form-data"):
            return jsonify({"error": "Content-Type must be multipart/form-data"}), 415

        assistant_id = request.form.get("assistant_id")
        image_date = request.form.get("image_date")

        # 사용자 권한 확인
        if not assistant_id:
            return jsonify({"error": "Authentication required"}), 401

        assistant = Assistant.query.get(assistant_id)
        if not assistant:
            return jsonify({"error": "Assistant not found"}), 404

        # 파일이 요청에 포함되어 있는지 확인
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]

        # 파일이 선택되었는지 확인
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # 파일 타입 확인
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # 파일 크기 확인
        file_data = file.read()
        if len(file_data) > 6 * 1024 * 1024:  # 6MB
            return jsonify({"error": "File size exceeds limit"}), 400

        # 파일 포인터를 다시 시작 위치로 되돌림
        file.seek(0)

        # 안전한 파일명으로 변환
        filename = secure_filename(file.filename)
        # 고유한 파일명 생성 (충돌 방지)
        unique_filename = (
            f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
        )

        # S3에 파일 업로드
        s3_client.upload_fileobj(
            file,
            S3_BUCKET,
            f"taxi_images/{unique_filename}",
            ExtraArgs={"ContentType": file.content_type},
        )

        # S3 URL 생성
        image_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/taxi_images/{unique_filename}"

        # 데이터베이스에 이미지 정보 저장
        new_image = Image(
            assistant_id=assistant_id,
            url=image_url,
            filename=unique_filename,
            date=datetime.strptime(image_date, "%Y-%m-%d").date(),
        )
        db.session.add(new_image)
        db.session.commit()

        return jsonify(new_image.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@image_bp.route("/api/image_delete", methods=["POST"])
def delete_images():
    try:
        image_ids = request.form.getlist("image_ids")
        user_id = get_current_user_id()

        if not image_ids:
            return jsonify({"error": "No image IDs provided"}), 400

        images = Image.query.filter(Image.id.in_(image_ids)).all()

        if not is_admin() and any(image.assistant_id != user_id for image in images):
            return jsonify({"error": "Unauthorized access"}), 403

        for image in images:
            try:
                s3_client.delete_object(
                    Bucket=S3_BUCKET, Key=f"taxi_images/{image.filename}"
                )
            except Exception as s3_error:
                print(f"Error deleting from S3: {str(s3_error)}")

            db.session.delete(image)
        db.session.commit()

        return jsonify({"message": "Images deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@image_bp.route("/admin/images/", methods=["GET"])
def get_all_images():
    try:
        if not is_admin():
            return jsonify({"error": "Unauthorized access"}), 403

        # 모든 이미지를 조회하고 조교 이름 정보를 포함
        images = (
            db.session.query(Image, Assistant.name.label("assistant_name"))
            .join(Assistant, Image.assistant_id == Assistant.id)
            .order_by(Image.date.desc())
            .all()
        )

        # 서명된 URL을 포함한 이미지 정보 생성
        result = []
        for image, assistant_name in images:
            image_data = image.to_dict()
            image_data["assistant_name"] = assistant_name
            signed_url = generate_presigned_url(image)
            if signed_url:
                image_data["signed_url"] = signed_url
            result.append(image_data)

        return render_template(
            "admin_images.html",
            images=result,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@image_bp.route("/api/admin/image_delete", methods=["POST"])
def admin_delete_images():
    try:
        if not is_admin():
            return jsonify({"error": "Unauthorized access"}), 403

        image_ids = request.form.getlist("image_ids")
        if not image_ids:
            return jsonify({"error": "No image IDs provided"}), 400

        images = Image.query.filter(Image.id.in_(image_ids)).all()

        for image in images:
            try:
                s3_client.delete_object(
                    Bucket=S3_BUCKET, Key=f"taxi_images/{image.filename}"
                )
            except Exception as s3_error:
                print(f"Error deleting from S3: {str(s3_error)}")

            db.session.delete(image)
        db.session.commit()

        return jsonify({"message": "Images deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@image_bp.route("/api/image_download/<int:image_id>", methods=["GET"])
def download_image(image_id):
    try:
        image = Image.query.get(image_id)
        if not image:
            return jsonify({"error": "Image not found"}), 404

        # S3에서 이미지 가져오기
        try:
            response = s3_client.get_object(
                Bucket=S3_BUCKET, Key=f"taxi_images/{image.filename}"
            )
            file_stream = response["Body"].read()

            return send_file(
                io.BytesIO(file_stream),
                mimetype=response["ContentType"],
                as_attachment=True,
                download_name=image.filename,
            )
        except Exception as s3_error:
            print(f"Error downloading from S3: {str(s3_error)}")
            return jsonify({"error": "Failed to download image"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
