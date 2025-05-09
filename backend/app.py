from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config import Config
from models import Base, Users, Admin, Lawyer, Judge, Courtregistrar, Caseparticipant

app = Flask(__name__, static_folder="../lcms-frontend/dist", static_url_path="/")
app.config.from_object(Config)

# Database setup
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Session and CORS
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    db = SessionLocal()
    user = db.query(Users).get(int(user_id))
    db.close()
    return user

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    phoneno = data.get("phoneno")
    cnic = data.get("cnic")
    dob = data.get("dob")
    password = data.get("password")
    role = data.get("role", "user").capitalize()

    valid_roles = ["Admin", "Courtregistrar", "Caseparticipant", "Lawyer", "Judge"]
    if role not in valid_roles:
        return jsonify({"success": False, "message": "Invalid role"}), 400

    db = SessionLocal()
    try:
        existing = db.query(Users).filter_by(firstname=firstname).first()
        if existing:
            return jsonify({"success": False, "message": "Username already exists"}), 400

        hashed_pw = generate_password_hash(password)
        user = Users(
            firstname=firstname,
            lastname=lastname,
            email=email,
            phoneno=phoneno,
            cnic=cnic,
            dob=dob,
            password=hashed_pw,
            role=role
        )
        db.add(user)
        db.flush()  # get user ID

        # Adds into role-specific table depending on role given in signup
        if role == "Admin":
            db.add(Admin(userid=user.userid))
        elif role == "Courtregistrar":
            db.add(Courtregistrar(userid=user.userid))
        elif role == "Caseparticipant":
            db.add(Caseparticipant(userid=user.userid))
        elif role == "Lawyer":
            db.add(Lawyer(userid=user.userid, barlicenseno=99999999))  # Dummy bar license for now
        elif role == "Judge":
            db.add(Judge(userid=user.userid))

        db.commit()
        return jsonify({"success": True, "message": "User registered successfully"})
    except Exception as e:
        db.rollback()
        print("Signup error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
    finally:
        db.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    firstname = data.get("firstname")
    password = data.get("password")

    db = SessionLocal()
    try:
        user = db.query(Users).filter_by(firstname=firstname).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify({
                "success": True,
                "message": "Logged in",
                "username": user.firstname,
                "role": user.role
            })
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    finally:
        db.close()

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    return jsonify({
        "success": True,
        "user": {
            "username": current_user.firstname,
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