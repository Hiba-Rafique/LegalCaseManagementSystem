from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash

from models import User, users
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Setup session & CORS
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Setup login manager
login_manager = LoginManager()
login_manager.init_app(app)

# Fake DB id counter
user_id_counter = 1

@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

@app.route("/api/signup", methods=["POST"])
def signup():
    global user_id_counter
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user")

    # Basic check
    if any(u.username == username for u in users.values()):
        return jsonify({"success": False, "message": "Username exists"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(str(user_id_counter), username, hashed_pw, role)
    users[str(user_id_counter)] = new_user
    user_id_counter += 1
    return jsonify({"success": True, "message": "User registered successfully"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    for user in users.values():
        if user.username == username and check_password_hash(user.password_hash, password):
            login_user(user)
            return jsonify({
                "success": True,
                "message": "Logged in",
                "username": user.username,
                "role": user.role
            })

    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    return jsonify({
        "success": True,
        "user": {
            "username": current_user.username,
            "role": current_user.role
        }
    })

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"})

if __name__ == "__main__":
    app.run(debug=True)
