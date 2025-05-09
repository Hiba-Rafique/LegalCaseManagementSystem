from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
from models import Users, Base  
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask setup
app = Flask(__name__, static_folder="../lcms-frontend/dist", static_url_path="/")
CORS(app, supports_credentials=True)

# SQLAlchemy engine and session setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Base.metadata.bind = engine
SessionLocal = sessionmaker(bind=engine)

@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    origin = request.headers.get('Origin')
    headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    if request.method == 'OPTIONS':
        return '', 204, headers

    data = request.get_json(force=True)
    firstname = data.get("FirstName", "").strip()
    password = data.get("password", "")
    role = data.get("role", "").capitalize()

    if not (firstname and password and role):
        return jsonify(success=False, message="Missing required fields"), 400, headers

    session = SessionLocal()

    try:
        existing_user = session.query(Users).filter_by(firstname=firstname).first()
        if existing_user:
            return jsonify(success=False, message="Username already exists."), 409, headers

        hashed_pw = generate_password_hash(password)

        new_user = Users(
            firstname=firstname,
            password=hashed_pw,
            role=role
        )
        session.add(new_user)
        session.commit()

    except IntegrityError as e:
        session.rollback()
        print(f"Integrity error: {e}")
        return jsonify(success=False, message="Role must be valid."), 400, headers

    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        return jsonify(success=False, message="Server error."), 500, headers

    finally:
        session.close()

    return jsonify(success=True, message="Signup successful."), 201, headers

# Serve frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    full_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
