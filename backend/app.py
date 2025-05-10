import datetime
from decimal import Decimal
from flask import Flask, request, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config import Config
from models import Base, Cases, Court, Payments, Users, Admin, Lawyer, Judge, Courtregistrar, Caseparticipant,t_courtaccess

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
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

@app.route("/")
def serve():
    return app.send_static_file("index.html")

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
    role = data.get("role", "user").strip().lower()  # Make role lowercase

    # Role mapping to ensure the correct capitalization in database
    role_mapping = {
        "courtregistrar": "CourtRegistrar",
        "caseparticipant": "CaseParticipant",
        "admin": "Admin",
        "lawyer": "Lawyer",
        "judge": "Judge"
    }

    role = role_mapping.get(role, role)  # Get the correct role or default to the input role

    valid_roles = ["Admin", "CourtRegistrar", "CaseParticipant", "Lawyer", "Judge"]
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
        db.flush()
        db.commit()

        session['user_id'] = user.userid
        login_user(user)

    except Exception as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return jsonify({"message": "An error occurred during sign-up."}), 500
        
    finally:
        db.close()

    return jsonify({
        "success": True,
        "message": "Signup successful. Please complete your profile.",
        "user_id": user.userid
    }), 201

@app.route('/api/complete-profile', methods=['POST'])
def complete_profile():
    db = SessionLocal()
    try:
        data = request.get_json()
        print(f"Data received: {data}")

        user_id = data.get('user_id') or session.get('user_id')
        if not user_id:
            return jsonify({"message": "User not logged in or session expired."}), 401

        user = db.query(Users).get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        profile_data = data.get('profile_data', {})
        print(f"Profile data: {profile_data}")

        print(f"User role: {user.role}")
        # Normalize role during profile completion
        role_mapping = {
            "courtregistrar": "CourtRegistrar",
            "caseparticipant": "CaseParticipant",
            "admin": "Admin",
            "lawyer": "Lawyer",
            "judge": "Judge"
        }
        role = user.role.lower()  # Normalize role to lowercase
        user.role = role_mapping.get(role, role)  # Update to correct role case if needed

        # The rest of the profile completion logic remains the same...
        if user.role == 'CaseParticipant':
            address = data.get('address')
            if address:
                client = Caseparticipant(userid=user.userid, address=address)
                db.add(client)
                db.commit()
                print(f"Inserted CaseParticipant: {client}")

        elif user.role == 'Lawyer':
            barlicenseno = data.get('barLicense')  
            experienceyears = data.get('experience')  
            specialization = data.get('specialization')

            if barlicenseno and experienceyears and specialization:
                print("All Lawyer fields present, inserting Lawyer...")
                try:
                    lawyer = Lawyer(
                        userid=user.userid,
                        barlicenseno=barlicenseno,
                        experienceyears=experienceyears,
                        specialization=specialization
                    )
                    db.add(lawyer)
                    db.commit()
                    print(f"Inserted Lawyer: {lawyer}")
                except Exception as e:
                    db.rollback()
                    print(f"Exception occurred while inserting Lawyer: {e}")
            else:
                print("One or more required Lawyer fields are missing.")

        elif user.role == 'Judge':
            position = data.get('position')
            specialization = data.get('specialization')
            experience = data.get('experience')
            if position and specialization and experience:
                judge = Judge(
                    userid=user.userid,
                    position=position,
                    specialization=specialization,
                    experience=experience
                )
                db.add(judge)
                db.commit()
                print(f"Inserted Judge: {judge}")

        elif user.role == 'CourtRegistrar':
            position = data.get('position')
            if position:
                registrar = Courtregistrar(userid=user.userid, position=position)
                db.add(registrar)
                db.commit()
                print(f"Inserted Court Registrar: {registrar}")

        login_user(user)
        return jsonify({"message": "Profile completed successfully"}), 200

    except Exception as e:
        error_message = str(e)
        print(f"Error occurred: {error_message}")
        db.rollback()
        return jsonify({"message": f"An error occurred while completing the profile: {error_message}"}), 500
    
    finally:
        db.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    db = SessionLocal()
    try:
        user = db.query(Users).filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify({
                "success": True,
                "message": "Logged in",
                "email": user.email,
                "role": user.role
            }), 200
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    finally:
        db.close()

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    db = SessionLocal()
    lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
    specialization = lawyer.specialization if lawyer else None
    barlicenseno = lawyer.barlicenseno if lawyer else None
    db.close()

    return jsonify({
        "success": True,
        "user": {
            "username": f"{current_user.firstname} {current_user.lastname}",
            "specialization": specialization,
            "barlicenseno": barlicenseno
        }
    })

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"})

@app.route('/api/lawyerprofile', methods=['GET'])
def get_lawyer_profile():
    db = SessionLocal()
    user_id = current_user.userid  
    
    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    lawyer = db.query(Lawyer).filter_by(userid=user_id).first()

    if not lawyer:
        return jsonify(success=False, message="Profile not found"), 404

    return jsonify(success=True, data={
        'firstName': current_user.firstname,
        'lastName': current_user.lastname,
        'email': current_user.email,
        'phone': current_user.phoneno,
        'specialization': lawyer.specialization,
        'cnic': current_user.cnic,
        'dob': current_user.dob.isoformat() if current_user.dob else '',
        'barLicense': lawyer.barlicenseno,
        'experience': lawyer.experienceyears
    })

@app.route('/api/lawyerprofile', methods=['PUT'])
def update_lawyer_profile():
    db = SessionLocal()
    user_id = current_user.userid

    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    data = request.get_json()
    lawyer = db.query(Lawyer).filter_by(userid=user_id).first()

    if not lawyer:
        return jsonify(success=False, message="Profile not found"), 404

    try:
        lawyer.specialization = data.get('specialization', lawyer.specialization)
        lawyer.barlicenseno = data.get('barLicense', lawyer.barlicenseno)
        lawyer.experienceyears = data.get('experience', lawyer.experienceyears)

        db.commit()
        return jsonify(success=True, message="Profile updated successfully")

    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
    

@app.route('/api/court', methods=['POST'])
@login_required
def add_court():
    db = SessionLocal()
    try:
        data = request.get_json()

        courtname = data.get('courtname')
        court_type = data.get('type')
        location = data.get('location')

        if not courtname or not court_type or not location:
            return jsonify({'status': 'error', 'message': 'All fields (courtname, type, location) are required'}), 400

        new_court = Court(courtname=courtname, type=court_type, location=location)
        db.add(new_court)
        db.flush()  

        
        if current_user.role == 'CourtRegistrar':
            registrar = db.query(Courtregistrar).filter_by(userid=current_user.userid).first()
            if registrar:
                registrar.courtid = new_court.courtid  # Associate court
                print(f"Linked court ID {new_court.courtid} to registrar {registrar.courtid}")
            else:
                return jsonify({'status': 'error', 'message': 'CourtRegistrar profile not found'}), 404

        db.commit()

        return jsonify({'status': 'success', 'message': 'Court added and linked to registrar', 'court_id': new_court.courtid}), 201

    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/registrarprofile', methods=['GET'])
@login_required
def get_registrar_profile():
    db = SessionLocal()
    try:
        user_id = current_user.userid

        registrar = db.query(Courtregistrar).filter_by(userid=user_id).first()

        if not registrar:
            return jsonify(success=False, message="Registrar profile not found"), 404

        return jsonify(success=True, data={
            'firstName': current_user.firstname,
            'lastName': current_user.lastname,
            'email': current_user.email,
            'phone': current_user.phoneno,
            'cnic': current_user.cnic,
            'dob': current_user.dob.isoformat() if current_user.dob else '',
            'position': registrar.position,
            'courtid': registrar.courtid  
        }), 200

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

    finally:
        db.close()

@app.route('/api/court', methods=['GET'])
@login_required
def get_court_for_registrar():
    db = SessionLocal()
    try:
        registrar = db.query(Courtregistrar).filter_by(userid=current_user.userid).first()
        if not registrar:
            return jsonify(success=False, message="Registrar profile not found"), 404

        if not registrar.courtid:
            return jsonify(success=False, message="Registrar is not assigned to any court"), 404

        court = db.query(Court).get(registrar.courtid)
        if not court:
            return jsonify(success=False, message="Court not found"), 404

        return jsonify(success=True, data={
            'courtname': court.courtname,
            'type': court.type,
            'location': court.location
        }), 200

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500
    finally:
        db.close()
        
        
@app.route('/api/payments', methods=['GET'])
@login_required
def get_lawyer_payments():
    db = SessionLocal()
    try:
        #fetch lawyer using userid
        lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
        if not lawyer:
            return jsonify({'status': 'error', 'message': 'Lawyer profile not found'}), 404

        #fetch payments linked to lawyerid
        payments = (
            db.query(Payments)
            .filter_by(lawyerid=lawyer.lawyerid)
            .join(Cases, Payments.caseid == Cases.caseid)
            .with_entities(
                Payments.paymentdate,
                Cases.title.label("casename"),
                Payments.purpose,
                Payments.balance,
                Payments.mode
            )
            .all()
        )

        
        result = [
            {
                "paymentdate": str(p.paymentdate),
                "casename": p.casename,
                "purpose": p.purpose,
                "balance": float(p.balance),
                "mode": p.mode
            }
            for p in payments
        ]

        return jsonify({'status': 'success', 'payments': result}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/payments', methods=['POST'])
@login_required
def create_payment():
    db = SessionLocal()
    try:
        data = request.get_json()

        casename = data.get('casename')
        purpose = data.get('purpose')
        balance = data.get('balance')
        mode = data.get('mode')
        paymentdate = data.get('paymentdate') or datetime.date.today()
        paymenttype = data.get('paymenttype')  # Get paymenttype from request

        if not all([casename, purpose, balance, mode, paymenttype]):
            return jsonify({'message': 'Missing required fields'}), 400  # Ensure paymenttype is also validated

        # 1. Get lawyer
        lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
        if not lawyer:
            return jsonify({'message': 'Lawyer not found'}), 404

        # 2. Get case by title
        case = db.query(Cases).filter_by(title=casename).first()
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # 3. Get courtid via courtaccess
        access_entry = db.query(t_courtaccess).filter(t_courtaccess.c.caseid == case.caseid).first()
        if not access_entry:
            return jsonify({'message': 'Court access entry not found'}), 404

        courtid = access_entry.courtid

        # 4. Create and save payment
        new_payment = Payments(
            mode=mode,
            purpose=purpose,
            balance=Decimal(balance),
            paymentdate=paymentdate,
            lawyerid=lawyer.lawyerid,
            caseid=case.caseid,
            courtid=courtid,
            paymenttype=paymenttype  # Add paymenttype
        )

        db.add(new_payment)
        db.commit()

        return jsonify({
            'message': 'Payment recorded successfully',
            'payment': {
                'paymentdate': str(paymentdate),
                'casename': casename,
                'purpose': purpose,
                'balance': float(balance),
                'mode': mode,
                'paymenttype': paymenttype  # Include paymenttype in the response
            }
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()



if __name__ == "__main__":
    app.run(debug=True)
