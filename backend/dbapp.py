import datetime
from decimal import Decimal
import logging
import os
import psycopg2
from flask import Flask, g, request, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from config import Config
from models import *

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
app.config.from_object(Config)

# Database setup
logging.basicConfig(level=logging.DEBUG)

def get_db_connection():
    return psycopg2.connect(Config.SQLALCHEMY_DATABASE_URI)

# Session and CORS
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE userid = %s", (user_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return Users.from_row(row)  # You must define from_row to construct the object
    return None

@app.route("/")
def serve():
    return app.send_static_file("index.html")

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    logging.debug(f"Received data for signup: {data}")

    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    phoneno = data.get("phoneno")
    cnic = data.get("cnic")
    dob = data.get("dob")
    password = data.get("password")
    role = data.get("role", "user").strip().lower()

    role_mapping = {
        "courtregistrar": "CourtRegistrar",
        "client": "CaseParticipant",
        "admin": "Admin",
        "lawyer": "Lawyer",
        "judge": "Judge"
    }

    role = role_mapping.get(role, role)
    valid_roles = ["Admin", "CourtRegistrar", "CaseParticipant", "Lawyer", "Judge"]
    if role not in valid_roles:
        return jsonify({"success": False, "message": "Invalid role"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE firstname=%s AND lastname=%s", (firstname, lastname))
        if cur.fetchone():
            return jsonify({"success": False, "message": "User already exists with the same name"}), 400

        hashed_pw = generate_password_hash(password)

        cur.execute("""
            INSERT INTO users (firstname, lastname, email, phoneno, cnic, dob, password, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING userid
        """, (firstname, lastname, email, phoneno, cnic, dob, hashed_pw, role))
        user_id = cur.fetchone()[0]
        conn.commit()

        session['user_id'] = user_id
        user = Users(userid=user_id, firstname=firstname, lastname=lastname, email=email, phoneno=phoneno, cnic=cnic, dob=dob, role=role, password=hashed_pw)
        login_user(user)

    except Exception as e:
        conn.rollback()
        logging.error(f"Error occurred during sign-up: {str(e)}")
        return jsonify({"message": "An error occurred during sign-up."}), 500

    finally:
        conn.close()

    return jsonify({
        "success": True,
        "message": "Signup successful. Please complete your profile.",
        "user_id": user.userid
    }), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if row:
            user = Users.from_row(row)
            if check_password_hash(user.password, password):
                login_user(user)
                mapped_role = "Client" if user.role == "CaseParticipant" else user.role
                return jsonify({
                    "success": True,
                    "message": "Logged in",
                    "email": user.email,
                    "role": mapped_role
                }), 200

        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    finally:
        conn.close()

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"})


