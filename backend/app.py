import datetime
from decimal import Decimal
import logging
import os
import traceback
from flask import Flask, g, request, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import aliased
# from logdecorator import log_action
from config import Config
from models import *
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
app.config.from_object(Config)

# Database setup
logging.basicConfig(level=logging.DEBUG)
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Session and CORS
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
# @log_action(action_type="LOAD_USER", entity_type="User")
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
    logging.debug(f"Received data for signup: {data}")

    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    phoneno = data.get("phoneno")
    cnic = data.get("cnic")
    dob = data.get("dob")
    password = data.get("password")
    role = data.get("role", "user").strip().lower()  # Make role lowercase

    logging.debug(f"Processed role: {role}")

    # Role mapping to ensure the correct capitalization in the database
    role_mapping = {
        "courtregistrar": "CourtRegistrar",
        "client": "CaseParticipant",
        "admin": "Admin",
        "lawyer": "Lawyer",
        "judge": "Judge"
    }

    role = role_mapping.get(role, role)  # Get the correct role or default to the input role
    logging.debug(f"Mapped role: {role}")

    valid_roles = ["Admin", "CourtRegistrar", "CaseParticipant", "Lawyer", "Judge"]
    if role not in valid_roles:
        logging.error(f"Invalid role received: {role}")
        return jsonify({"success": False, "message": "Invalid role"}), 400

    db = SessionLocal()
    try:
        # Check if a user with the same firstname and lastname already exists
        existing = db.query(Users).filter_by(firstname=firstname, lastname=lastname).first()
        if existing:
            logging.warning(f"User already exists with firstname: {firstname} and lastname: {lastname}")
            return jsonify({"success": False, "message": "User already exists with the same name"}), 400

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

        logging.info(f"User created: {user.userid}")
        session['user_id'] = user.userid
        login_user(user)

    except Exception as e:
        db.rollback()
        logging.error(f"Error occurred during sign-up: {str(e)}")
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

        elif user.role == 'Admin':
            admin = Admin(userid=user.userid)
            db.add(admin)
            db.commit()
            print(f"Inserted Admin: {admin}")

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
                    expyears=experience
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
        return jsonify({
    "message": "Profile completed successfully",
    "success": True
}), 200

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

            # 🔁 Map CaseParticipant to Client
            mapped_role = "Client" if user.role == "CaseParticipant" else user.role

            return jsonify({
                "success": True,
                "message": "Logged in",
                "email": user.email,
                "role": mapped_role
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
# @log_action(action_type="Logout",entity_type="User")
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
# @log_action(action_type="Update",entity_type="Lawyer")
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
    

@app.route('/api/registrarprofile', methods=['PUT'])
# @log_action(action_type="Update",entity_type="Court Registrar")
def update_registrar_profile():
    db = SessionLocal()
    user_id = current_user.userid

    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    data = request.get_json()
    registrar = db.query(Courtregistrar).filter_by(userid=user_id).first()

    if not registrar:
        return jsonify(success=False, message="Profile not found"), 404

    try:
        registrar.position = data.get('position', registrar.position)

        db.commit()
        return jsonify(success=True, message="Profile updated successfully")

    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
    
@app.route('/api/clientprofile', methods=['PUT'])
# @log_action(action_type="Update",entity_type="Client")
def update_client_profile():
    db = SessionLocal()
    user_id = current_user.userid

    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    data = request.get_json()
    client = db.query(Caseparticipant).filter_by(userid=user_id).first()

    if not client:
        return jsonify(success=False, message="Profile not found"), 404

    try:
        client.address = data.get('address', client.address)
        

        db.commit()
        return jsonify(success=True, message="Profile updated successfully")

    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
    
    
@app.route('/api/judgeprofile', methods=['PUT'])
# @log_action(action_type="Update",entity_type="Judge")
def update_judge_profile():
    db = SessionLocal()
    user_id = current_user.userid

    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    data = request.get_json()
    judge = db.query(Judge).filter_by(userid=user_id).first()

    if not judge:
        return jsonify(success=False, message="Profile not found"), 404

    try:
        judge.specialization = data.get('specialization', judge.specialization)
        judge.appointmentdate = data.get('appointmentdate', judge.appointmentdate)
        judge.expyears = data.get('expyears', judge.expyears),
        judge.position = data.get('position',judge.position)

        db.commit()
        return jsonify(success=True, message="Profile updated successfully")

    except Exception as e:
        db.rollback()
        return jsonify(success=False, message=str(e)), 500
    

@app.route('/api/court', methods=['POST'])
# @log_action(action_type="Create",entity_type="Court")
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
            "id":court.courtid,
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
def get_payments():
    db = SessionLocal()
    try:
        # Check if the user is a lawyer or a court registrar
        if current_user.role == 'lawyer':
            # Fetch lawyer using userid
            lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
            if not lawyer:
                return jsonify({'status': 'error', 'message': 'Lawyer profile not found'}), 404

            # Fetch payments linked to the lawyer's id
            payments = (
                db.query(Payments)
                .filter_by(lawyerid=lawyer.lawyerid)
                .join(Cases, Payments.caseid == Cases.caseid)
                .with_entities(
                    Payments.paymentdate,
                    Cases.title.label("casename"),
                    Payments.purpose,
                    Payments.balance,
                    Payments.mode,
                    Payments.paymenttype
                )
                .all()
            )

        elif current_user.role == 'CourtRegistrar':
            # Fetch payments for all cases in the court assigned to the court registrar
            court_registrar = db.query(Courtregistrar).filter_by(userid=current_user.userid).first()
            if not court_registrar:
                return jsonify({'status': 'error', 'message': 'Court registrar profile not found'}), 404
            
            # Fetch court_id linked to court registrar through t_courtaccess
            court_id = court_registrar.courtid  # Assuming this field exists
            
            # Fetch payments related to cases in the court accessed by the court registrar
            payments = (
                db.query(Payments)
                .join(Cases, Payments.caseid == Cases.caseid)
                .join(t_courtaccess, t_courtaccess.c.caseid == Cases.caseid)  # Use t_courtaccess.c.caseid
                .filter(t_courtaccess.c.courtid == court_id)  # Filter by court_id
                .with_entities(
                    Payments.paymentdate,
                    Cases.title.label("casename"),
                    Payments.purpose,
                    Payments.balance,
                    Payments.mode,
                    Payments.paymenttype
                )
                .all()
            )

        else:
            return jsonify({'status': 'error', 'message': 'Unauthorized role'}), 403

        # Prepare response data
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
# @log_action(action_type="Create",entity_type="Paymnts")
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
        paymenttype = data.get('paymenttype')  

        if not all([casename, purpose, balance, mode, paymenttype]):
            return jsonify({'message': 'Missing required fields'}), 400  

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
            paymenttype=paymenttype  
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
                'paymenttype': paymenttype  
            }
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/clientprofile', methods=['GET'])
@login_required
def get_client_profile():
    db = SessionLocal()
    try:
        user_id = current_user.userid

        client = db.query(Caseparticipant).filter_by(userid=user_id).first()

        if not client:
            return jsonify(success=False, message="Client profile not found"), 404

        return jsonify(success=True, data={
            'firstName': current_user.firstname,
            'lastName': current_user.lastname,
            'email': current_user.email,
            'phone': current_user.phoneno,
            'cnic': current_user.cnic,
            'dob': current_user.dob.isoformat() if current_user.dob else '',
            'address':client.address  
        }), 200

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

    finally:
        db.close()

@app.route('/api/judgeprofile', methods=['GET'])
@login_required
def get_judge_profile():
    db = SessionLocal()
    try:
        user_id = current_user.userid

        judge = db.query(Judge).filter_by(userid=user_id).first()

        if not judge:
            return jsonify(success=False, message="Judge profile not found"), 404

        return jsonify(success=True, data={
            'firstName': current_user.firstname,
            'lastName': current_user.lastname,
            'email': current_user.email,
            'phone': current_user.phoneno,
            'cnic': current_user.cnic,
            'dob': current_user.dob.isoformat() if current_user.dob else '',
            'position': judge.position,
            'appointmentdate':judge.appointmentdate,
            'expyears':judge.expyears,
            'specialization':judge.specialization
        }), 200

    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

    finally:
        db.close()


@app.route("/api/prosecutor", methods=['POST'])
# @log_action(action_type="Create",entity_type="Prosecutor")
@login_required
def create_prosecutor():
    db = SessionLocal()
    try:
        data = request.get_json()
        name = data.get('name')
        experience = data.get('experience')
        status = data.get('status')
        case_names = data.get('case_names', [])  

        if not name or experience is None or status is None:
            return jsonify({"error": "Missing required fields"}), 400

        
        new_prosecutor = Prosecutor(name=name, experience=experience, status=status)
        db.add(new_prosecutor)
        db.commit()
        db.refresh(new_prosecutor)

        
        if case_names:
            case_ids = db.query(Cases.caseid).filter(Cases.name.in_(case_names)).all()
            case_ids = [c[0] for c in case_ids]  

            assignments = [
                t_prosecutorassign(prosecutor_id=new_prosecutor.prosecutorid, case_id=cid)
                for cid in case_ids
            ]
            db.add_all(assignments)
            db.commit()

        return jsonify({
            "id": new_prosecutor.id,
            "name": new_prosecutor.name,
            "experience": new_prosecutor.experience,
            "status": new_prosecutor.status,
            "assigned_cases": case_names
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

        
# api made by kaif

@app.route('/api/courtrooms', methods=['POST'])
@login_required
def create_courtroom():
    db = SessionLocal()
    try:
        data = request.get_json()
        courtroom = Courtroom(
            number=data.get('number'),
            name=data.get('name'),
            capacity=data.get('capacity'),
            type=data.get('type'),
            status=data.get('status', 'Available')
        )
        db.add(courtroom)
        db.commit()
        return jsonify({'message': 'Courtroom created successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/courtrooms', methods=['GET'])
@login_required
def get_courtrooms():
    db = SessionLocal()
    try:
        courtrooms = db.query(Courtroom).all()
        result = [
            {
                'number': r.courtroomno,
                'capacity': r.capacity,
                'status': r.status
            }
            for r in courtrooms
        ]
        return jsonify({'courtrooms': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

# cases api
@app.route('/api/cases', methods=['POST'])
@login_required
def create_case():
    db = SessionLocal()
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        casetype = data.get('casetype')
        filingdate = data.get('filingdate') or datetime.date.today()
        status = data.get('status', 'Open')

        if not title or not casetype:
            return jsonify({'message': 'Title and case type are required'}), 400

        new_case = Cases(
            title=title,
            description=description,
            casetype=casetype,
            filingdate=filingdate,
            status=status
        )
        db.add(new_case)
        db.commit()

        return jsonify({'message': 'Case created successfully', 'case_id': new_case.caseid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
        
@app.route('/api/courtrooms/<int:courtid>', methods=['GET'])
@login_required
def get_courtrooms_by_court(courtid):
    db = SessionLocal()
    try:
        courtrooms = db.query(Courtroom).filter(Courtroom.courtid == courtid).all()
        result = [
            {
                'id': r.courtroomid,
                'name': "CourtRoom " + str(r.courtroomid),
                'number': r.courtroomno,
                'capacity': r.capacity,
                'status': 'Available' if r.availability else 'Occupied'
            }
            for r in courtrooms
        ]
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases', methods=['GET'])
@login_required
def get_cases():
    db = SessionLocal()
    try:
        # Filter parameters
        query_params = request.args
        status = query_params.get('status')
        casetype = query_params.get('casetype')
        title = query_params.get('title')

        userid = current_user.userid
        role = current_user.role

        query = db.query(Cases)

        # Role-based access
        if role == 'Lawyer':
            lawyer = db.query(Lawyer).filter_by(userid=userid).first()
            if not lawyer:
                return jsonify({'message': 'Lawyer profile not found'}), 404
            query = query.join(Cases.lawyer).filter(Lawyer.lawyerid == lawyer.lawyerid)

        elif role == 'Judge':
            judge = db.query(Judge).filter_by(userid=userid).first()
            if not judge:
                return jsonify({'message': 'Judge profile not found'}), 404

            query = db.query(Cases).join(Cases.judge).filter(Judge.judgeid == judge.judgeid)
            cases = query.distinct().all()

            result = []
            for c in cases:
                court_names = [court.courtname for court in c.court if court.courtname]
                court_name_str = ', '.join(court_names)

                lawyer_names = []
                for lawyer in c.lawyer:
                    if lawyer.users:
                        full_name = f"{lawyer.users.firstname or ''} {lawyer.users.lastname or ''}".strip()
                        lawyer_names.append(full_name)
                lawyers_str = ' & '.join(lawyer_names)

                history = [
                    {
                        'date': h.actiondate.isoformat() if h.actiondate else None,
                        'event': h.actiontaken
                    }
                    for h in c.casehistory
                ]

                final_decision = None
                if c.finaldecision:
                    fd = c.finaldecision[0]
                    final_decision = {
                        'verdict': fd.verdict,
                        'summary': fd.decisionsummary,
                        'date': fd.decisiondate.isoformat() if fd.decisiondate else None
                    }

                evidence = [
                    {
                        'id': e.evidenceid,
                        'type': e.evidencetype,
                        'description': e.description,
                        'submittedDate': e.submitteddate.isoformat() if e.submitteddate else None,
                        'evidencePath': e.filepath
                    }
                    for e in c.evidence
                ]

                witness_links = db.query(Witnesscase).filter_by(caseid=c.caseid).all()
                witnesses = []
                for link in witness_links:
                    witness = db.query(Witnesses).filter_by(witnessid=link.witnessid).first()
                    if witness:
                        witnesses.append({
                            'id': witness.witnessid,
                            'firstName': witness.firstname,
                            'lastName': witness.lastname,
                            'cnic': witness.cnic,
                            'phone': witness.phone,
                            'email': witness.email,
                            'address': witness.address,
                            'pastHistory': witness.pasthistory
                        })

                result.append({
                    'id': c.caseid,
                    'title': c.title,
                    'description': c.description,
                    'caseType': c.casetype,
                    'filingDate': c.filingdate.isoformat() if c.filingdate else None,
                    'status': c.status,
                    'lawyers': lawyers_str,
                    'clientName': "",  # Optional to populate from Caseparticipant
                    'courtName': court_name_str,
                    'nextHearing': "N/A",  # Can be extended using c.hearings
                    'remarks': "",
                    'finalDecision': final_decision,
                    'history': history,
                    'evidence': evidence,
                    'witnesses': witnesses
                })

            return jsonify({'cases': result}), 200

        elif role == 'CaseParticipant':
            participant = db.query(Caseparticipant).filter_by(userid=userid).first()
            if not participant:
                return jsonify({'message': 'CaseParticipant profile not found'}), 404

            # Step 1: Get accessible case IDs from t_caseparticipantaccess
            access_rows = db.execute(
                t_caseparticipantaccess.select().filter_by(participantid=participant.participantid)
            ).fetchall()
            case_ids = [row[0] for row in access_rows]


            if not case_ids:
                return jsonify({'cases': []}), 200

            # Step 2: Query cases and build full detail
            cases = db.query(Cases).filter(Cases.caseid.in_(case_ids)).distinct().all()
            result = []

            for c in cases:
                court_names = [court.courtname for court in c.court if court.courtname]
                court_name_str = ', '.join(court_names)

                lawyer_names = []
                for lawyer in c.lawyer:
                    if lawyer.users:
                        full_name = f"{lawyer.users.firstname or ''} {lawyer.users.lastname or ''}".strip()
                        lawyer_names.append(full_name)
                lawyers_str = ' & '.join(lawyer_names)

                history = [
                    {
                        'date': h.actiondate.isoformat() if h.actiondate else None,
                        'event': h.actiontaken
                    }
                    for h in c.casehistory
                ]

                final_decision = None
                if c.finaldecision:
                    fd = c.finaldecision[0]
                    final_decision = {
                        'verdict': fd.verdict,
                        'summary': fd.decisionsummary,
                        'date': fd.decisiondate.isoformat() if fd.decisiondate else None
                    }

                evidence = [
                    {
                        'id': e.evidenceid,
                        'type': e.evidencetype,
                        'description': e.description,
                        'submittedDate': e.submitteddate.isoformat() if e.submitteddate else None,
                        'evidencePath': e.filepath
                    }
                    for e in c.evidence
                ]

                witness_links = db.query(Witnesscase).filter_by(caseid=c.caseid).all()
                witnesses = []
                for link in witness_links:
                    witness = db.query(Witnesses).filter_by(witnessid=link.witnessid).first()
                    if witness:
                        witnesses.append({
                            'id': witness.witnessid,
                            'firstName': witness.firstname,
                            'lastName': witness.lastname,
                            'cnic': witness.cnic,
                            'phone': witness.phone,
                            'email': witness.email,
                            'address': witness.address,
                            'pastHistory': witness.pasthistory
                        })

                result.append({
                    'id': c.caseid,
                    'title': c.title,
                    'description': c.description,
                    'caseType': c.casetype,
                    'filingDate': c.filingdate.isoformat() if c.filingdate else None,
                    'status': c.status,
                    'lawyers': lawyers_str,
                    'clientName': "",  # Optional to populate
                    'courtName': court_name_str,
                    'nextHearing': "N/A",
                    'remarks': "",
                    'finalDecision': final_decision,
                    'history': history,
                    'evidence': evidence,
                    'witnesses': witnesses
                })

            return jsonify({'cases': result}), 200

        elif role == 'CourtRegistrar':
            court_registrar = db.query(Courtregistrar).filter_by(userid=userid).first()
            if not court_registrar:
                return jsonify({'message': 'CourtRegistrar not found'}), 404

            court_id = court_registrar.courtid
            court_access_cases = db.execute(
                t_courtaccess.select().filter_by(courtid=court_id)
            ).fetchall()

            if not court_access_cases:
                return jsonify({'message': 'No cases found for this court.'}), 404

            case_ids = [row[0] for row in court_access_cases]
            cases = db.query(Cases).filter(Cases.caseid.in_(case_ids)).all()

            if not cases:
                return jsonify({'message': 'No cases found.'}), 404

            result = [
                {
                    'caseid': c.caseid,
                    'title': c.title,
                    'description': c.description,
                    'casetype': c.casetype,
                    'filingdate': c.filingdate.isoformat() if c.filingdate else None,
                    'status': c.status,
                }
                for c in cases
            ]

            return jsonify({'cases': result}), 200

        # Apply filters for non-judge roles
        if status:
            query = query.filter(Cases.status == status)
        if casetype:
            query = query.filter(Cases.casetype == casetype)
        if title:
            query = query.filter(Cases.title.ilike(f"%{title}%"))

        cases = query.distinct().all()

        result = [
            {
                'caseid': c.caseid,
                'title': c.title,
                'description': c.description,
                'casetype': c.casetype,
                'filingdate': c.filingdate.isoformat() if c.filingdate else None,
                'status': c.status,
            }
            for c in cases
        ]

        return jsonify({'cases': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

    finally:
        db.close()




@app.route('/api/hearings', methods=['GET'])
@login_required
def get_hearings_role():
    db = SessionLocal()
    try:
        userid = current_user.userid
        role = current_user.role

        query = db.query(Hearings)

        # Fetch hearings based on the role
        if role == 'Lawyer':
            lawyer = db.query(Lawyer).filter_by(userid=userid).first()
            if not lawyer:
                return jsonify({'message': 'Lawyer profile not found'}), 404
            query = query.join(Cases).join(Cases.lawyer).filter(Lawyer.lawyerid == lawyer.lawyerid)

        elif role == 'Judge':
            judge = db.query(Judge).filter_by(userid=userid).first()
            if not judge:
                return jsonify({'message': 'Judge profile not found'}), 404
            query = query.join(Cases).join(Cases.judge).filter(Judge.judgeid == judge.judgeid)

        elif role == 'CaseParticipant':
            participant = db.query(Caseparticipant).filter_by(userid=userid).first()
            if not participant:
                return jsonify({'message': 'CaseParticipant profile not found'}), 404
            query = query.join(Cases).join(Cases.caseparticipant).filter(Caseparticipant.participantid == participant.participantid)

        elif role == 'CourtRegistrar':
            # Get the CourtRegistrar associated with the current user
            court_registrar = db.query(Courtregistrar).filter_by(userid=userid).first()

            if not court_registrar:
                return jsonify({'message': 'CourtRegistrar not found'}), 404

            # Get the courtId associated with the CourtRegistrar
            court_id = court_registrar.courtid

            # Fetch court access cases related to the courtId using the manually defined table
            court_access_cases = db.execute(
                t_courtaccess.select().filter_by(courtid=court_id)
            ).fetchall()

            if not court_access_cases:
                return jsonify({'message': 'No cases found for this court.'}), 404

            # Extract the caseIds from t_courtaccess
            case_ids = [row[0] for row in court_access_cases]

            # Query the Hearings table to fetch hearings associated with these caseIds
            query = query.filter(Hearings.caseid.in_(case_ids))

        elif role == 'Admin':
            pass  # Admin can see all hearings

        # Fetch hearings
        hearings = query.distinct().all()

        result = [
            {
                # 'casename'
                'hearingid': h.hearingid,
                'hearingdate': h.hearingdate.isoformat(),
                'hearingtime': h.hearingtime.strftime("%H:%M") if h.hearingtime else None,
                'courtroomid': getattr(h, 'courtroomid', 'N/A')  # Optional
            }
            for h in hearings
        ]

        return jsonify({'hearings': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

    finally:
        db.close()


@app.route('/api/casebyid', methods=['GET'])
@login_required
def get_cases_by_id():
    db = SessionLocal()
    try: 
        user_role = current_user.role.lower()  # 'lawyer', 'client', or 'judge'
        user_id = current_user.userid

        query = db.query(Cases)

        if user_role == 'lawyer':
            query = query.filter(Cases.lawyerid == user_id)
        elif user_role == 'client':
            query = query.filter(Cases.clientid == user_id)
        elif user_role == 'judge':
            query = query.filter(Cases.judgeid == user_id)
        else:
            return jsonify({'message': 'Invalid user role'}), 400

        cases = query.all()

        result = [
            {
                'caseid': c.caseid,
                'title': c.title,
                'description': c.description,
                'casetype': c.casetype,
                'filingdate': c.filingdate.isoformat() if c.filingdate else None,
                'status': c.status,
                'lawyerid': c.lawyerid,
                'clientid': c.clientid,
                'judgeid': c.judgeid,
            }
            for c in cases
        ]

        return jsonify({'cases': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()



@app.route('/api/cases/<int:case_id>', methods=['PUT'])
@login_required
def update_case(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        case = db.query(Cases).get(case_id)

        if not case:
            return jsonify({'message': 'Case not found'}), 404

        case.title = data.get('title', case.title)
        case.description = data.get('description', case.description)
        case.casetype = data.get('casetype', case.casetype)
        case.status = data.get('status', case.status)

        db.commit()
        return jsonify({'message': 'Case updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/cases/<int:case_id>', methods=['DELETE'])
@login_required
def delete_case(case_id):
    db = SessionLocal()
    try:
        case = db.query(Cases).get(case_id)

        if not case:
            return jsonify({'message': 'Case not found'}), 404

        db.delete(case)
        db.commit()
        return jsonify({'message': 'Case deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/<int:case_id>/assign', methods=['POST'])
@login_required
def assign_case(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        assignee_id = data.get('assignee_id')
        role = data.get('role')  # 'lawyer' or 'judge'

        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        if role == 'lawyer':
            lawyer = db.query(Lawyer).get(assignee_id)
            if not lawyer:
                return jsonify({'message': 'Lawyer not found'}), 404
            case.lawyer.append(lawyer)
        elif role == 'judge':
            judge = db.query(Judge).get(assignee_id)
            if not judge:
                return jsonify({'message': 'Judge not found'}), 404
            case.judge.append(judge)
        else:
            return jsonify({'message': 'Invalid role'}), 400

        db.commit()
        return jsonify({'message': 'Case assigned successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/<int:case_id>/history', methods=['GET'])
@login_required
def get_case_history(case_id):
    db = SessionLocal()
    try:
        history = db.query(Casehistory).filter_by(caseid=case_id).all()
        result = []

        for h in history:
            case = db.query(Cases).filter_by(caseid=case_id).first()

            # Fetch related judge (first one for simplicity)
            judge = case.judge[0].users if case.judge else None
            lawyer = case.lawyer[0].users if case.lawyer else None
            client = case.caseparticipant[0].users if case.caseparticipant else None

            result.append({
                'caseName': case.title,
                'judgeName': f"{judge.firstname} {judge.lastname}" if judge else "N/A",
                'lawyerName': f"{lawyer.firstname} {lawyer.lastname}" if lawyer else "N/A",
                'clientName': f"{client.firstname} {client.lastname}" if client else "N/A",
                'remarks': h.remarks,
                'actionDate': h.actiondate.isoformat() if h.actiondate else None,
                'actionTaken': h.actiontaken,
                'status': case.status  # or h.status if it exists per entry
            })

        return jsonify({'history': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

        
# @app.route('/api/cases/<int:case_id>/history', methods=['GET'])
# @login_required
# def get_case_history(case_id):
#     db = SessionLocal()
#     try:
#         history = db.query(Casehistory).filter_by(caseid=case_id).all()
#         result = [
#             {
#                 'actiondate': h.actiondate.isoformat(),
#                 'actiontaken': h.actiontaken,
#                 'remarks': h.remarks
#             }
#             for h in history
#         ]
#         return jsonify({'history': result}), 200
#     except Exception as e:
#         return jsonify({'message': str(e)}), 500
#     finally:
#         db.close()
 
        
@app.route('/api/cases/analytics', methods=['GET'])
@login_required
def get_case_analytics():
    db = SessionLocal()
    try:
        total_cases = db.query(Cases).count()
        open_cases = db.query(Cases).filter_by(status='Open').count()
        closed_cases = db.query(Cases).filter_by(status='Closed').count()

        return jsonify({
            'total_cases': total_cases,
            'open_cases': open_cases,
            'closed_cases': closed_cases
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        


@app.route('/api/appeals', methods=['POST'])
@login_required
def create_appeal():
    db = SessionLocal()
    try:
        data = request.get_json()

        # Look up the caseid using casename, court, and casetype
        case = db.query(Cases).filter(
            Cases.title == data.get('casename'),
            Cases.casetype == data.get('casetype'),
            Cases.description == data.get('description')
        ).first()

        if not case:
            return jsonify({'message': 'Case not found with the given details'}), 404

        # Look up the court id (assuming we need it)
        court = db.query(Court).filter(Court.courtname == data.get('court')).first()
        if not court:
            return jsonify({'message': 'Court not found'}), 404

        # Create the appeal object using the found caseid and default appealdate
        appeal = Appeals(
            appealdate=datetime.now(),  # Set current date as appeal date
            appealstatus=data.get('appealStatus', 'Under Review'),  # Default status is 'Under Review'
            caseid=case.caseid  # Use the caseid from the looked-up case
        )

        db.add(appeal)
        db.commit()
        return jsonify({'message': 'Appeal created successfully'}), 201

    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/appeals', methods=['GET'])
@login_required
def get_appeals():
    db = SessionLocal()
    try:
        # Perform the join with the relevant tables
        appeals = db.query(
            Appeals.appealdate,
            Appeals.appealstatus,
            Appeals.decisiondate,
            Appeals.decision,
            Cases.title.label('casename'),
            Court.courtname
        ).join(
            Cases, Cases.caseid == Appeals.caseid
        ).join(
            t_courtaccess, t_courtaccess.c.caseid == Cases.caseid
        ).join(
            Court, Court.courtid == t_courtaccess.c.courtid
        ).all()
        
        result = [
            {
                'appealdate': appeal.appealdate,
                'appealstatus': appeal.appealstatus,
                'decisiondate': appeal.decisiondate,
                'decision': appeal.decision,
                'casename': appeal.casename,
                'courtname': appeal.courtname
            }
            for appeal in appeals
        ]

        return jsonify({'appeals': result}), 200
    except Exception as e:
        logging.error(f"Error: {str(e)}", exc_info=True)  # Logs the error with the traceback
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()


#Hearings API
@app.route('/api/hearings', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Hearings")
def schedule_hearing():
    db = SessionLocal()
    try:
        data = request.get_json()
        hearing = Hearings(
            caseid=data.get('caseid'),
            hearingdate=data.get('hearingdate'),
            hearingtime=data.get('hearingtime'),
            courtroomid=data.get('courtroomid')
        )
        db.add(hearing)
        db.commit()
        return jsonify({'message': 'Hearing scheduled successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/hearings', methods=['GET'])
@login_required
def get_hearings():
    db = SessionLocal()
    try:
        userid = current_user.userid
        role = current_user.role

        query = db.query(Hearings)

        if role == 'Lawyer':
            lawyer = db.query(Lawyer).filter_by(userid=userid).first()
            if not lawyer:
                return jsonify({'message': 'Lawyer profile not found'}), 404
            query = query.join(Cases).join(Cases.lawyer).filter(Lawyer.lawyerid == lawyer.lawyerid)

        elif role == 'Judge':
            judge = db.query(Judge).filter_by(userid=userid).first()
            if not judge:
                return jsonify({'message': 'Judge profile not found'}), 404
            query = query.join(Cases).join(Cases.judge).filter(Judge.judgeid == judge.judgeid)

        elif role == 'CaseParticipant':
            participant = db.query(Caseparticipant).filter_by(userid=userid).first()
            if not participant:
                return jsonify({'message': 'CaseParticipant profile not found'}), 404
            query = query.join(Cases).join(Cases.caseparticipant).filter(Caseparticipant.participantid == participant.participantid)

        elif role == 'Admin':
            pass  # show all hearings

        hearings = query.distinct().all()

        result = [
            {
                'hearingid': h.hearingid,
                'hearingdate': h.hearingdate.isoformat(),
                'hearingtime': h.hearingtime.strftime("%H:%M") if h.hearingtime else None,
                'courtroomid': getattr(h, 'courtroomid', 'N/A')  # Optional
            }
            for h in hearings
        ]

        return jsonify({'hearings': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

    finally:
        db.close()


# Bails API
@app.route('/api/bails', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Bails")
def create_bail():
    db = SessionLocal()
    try:
        data = request.get_json()
        case_id = data.get('case_id')
        amount = data.get('amount')
        bail_date = data.get('bail_date') or datetime.date.today()
        status = data.get('status', 'Pending')

        if not case_id or not amount:
            return jsonify({'message': 'Case ID and amount are required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Create a new bail record
        new_bail = Bail(
            caseid=case_id,
            amount=Decimal(amount),
            baildate=bail_date,
            status=status
        )
        db.add(new_bail)
        db.commit()

        return jsonify({'message': 'Bail created successfully', 'bail_id': new_bail.bailid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/bails/<int:case_id>', methods=['GET'])
@login_required
def get_bail(bail_id):
    db = SessionLocal()
    try:
        bail = db.query(Bail).get(bail_id)
        if not bail:
            return jsonify({'message': 'Bail not found'}), 404

        return jsonify({
            'bail_id': bail.bailid,
            'case_id': bail.caseid,
            'amount': float(bail.amount),
            'bail_date': bail.baildate.isoformat(),
            'status': bail.status
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/bails', methods=['GET'])
@login_required
def get_bails_for_lawyer():
    db = SessionLocal()
    try:
        if current_user.role != 'Lawyer':
            return jsonify({'message': 'Access denied'}), 403

        # Get the lawyer profile based on the current user's ID
        lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
        if not lawyer:
            return jsonify({'message': 'Lawyer profile not found'}), 404

        # Get all bails linked to this lawyer’s cases
        bails = (
            db.query(Bail)
            .join(Cases, Bail.caseid == Cases.caseid)
            .join(Cases.lawyer)
            .filter(Lawyer.lawyerid == lawyer.lawyerid)
            .all()
        )

        result = [
            {
                'bailid': b.bailid,
                'caseid': b.caseid,
                'bailstatus': b.bailstatus,
                'bailamount': float(b.bailamount) if b.bailamount else None,
                'baildate': b.baildate.isoformat() if b.baildate else None,
                'remarks': b.remarks,
                'bailcondition': b.bailcondition
            }
            for b in bails
        ]
        return jsonify({'bails': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()


@app.route('/api/cases/<int:case_id>/bails', methods=['GET'])
@login_required
def get_bails_for_case(case_id):
    db = SessionLocal()
    try:
        bails = db.query(Bail).filter_by(caseid=case_id).all()
        result = [
            {
                'bail_id': b.bailid,
                'amount': float(b.amount),
                'bail_date': b.baildate.isoformat(),
                'status': b.status
            }
            for b in bails
        ]
        return jsonify({'bails': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/bails/<int:bail_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "Bails")
def update_bail(bail_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        bail = db.query(Bail).get(bail_id)

        if not bail:
            return jsonify({'message': 'Bail not found'}), 404

        bail.amount = data.get('amount', bail.amount)
        bail.status = data.get('status', bail.status)
        bail.baildate = data.get('bail_date', bail.baildate)

        db.commit()
        return jsonify({'message': 'Bail updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/bails/<int:bail_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Bails")
def delete_bail(bail_id):
    db = SessionLocal()
    try:
        bail = db.query(Bail).get(bail_id)
        if not bail:
            return jsonify({'message': 'Bail not found'}), 404

        db.delete(bail)
        db.commit()
        return jsonify({'message': 'Bail deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

# Surety API
@app.route('/api/surety', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Surety")
def create_surety():
    db = SessionLocal()
    try:
        data = request.get_json()
        surety = Surety(
            name=data.get('name'),
            cnic=data.get('cnic'),
            address=data.get('address'),
            relationship=data.get('relationship'),
            bailid=data.get('bailid')
        )
        db.add(surety)
        db.commit()
        return jsonify({'message': 'Surety created successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/surety/<int:surety_id>', methods=['GET'])
@login_required
def get_surety(surety_id):
    db = SessionLocal()
    try:
        surety = db.query(Surety).get(surety_id)
        if not surety:
            return jsonify({'message': 'Surety not found'}), 404

        return jsonify({
            'surety_id': surety.suretyid,
            'name': surety.name,
            'cnic': surety.cnic,
            'address': surety.address,
            'relationship': surety.relationship,
            'bailid': surety.bailid
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/surety/<int:surety_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "Surety")
def update_surety(surety_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        surety = db.query(Surety).get(surety_id)

        if not surety:
            return jsonify({'message': 'Surety not found'}), 404

        surety.name = data.get('name', surety.name)
        surety.cnic = data.get('cnic', surety.cnic)
        surety.address = data.get('address', surety.address)
        surety.relationship = data.get('relationship', surety.relationship)

        db.commit()
        return jsonify({'message': 'Surety updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/surety/from-lawyer', methods=['GET'])
@login_required
def get_surety_by_lawyer():
    db = SessionLocal()
    try:
        if current_user.role != 'Lawyer':
            return jsonify({'message': 'Only lawyers can access this resource'}), 403

        # Get the lawyer object
        lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
        if not lawyer:
            return jsonify({'message': 'Lawyer not found'}), 404

        # Join Bail → Cases → caselawyeraccess manually
        bail = (
            db.query(Bail)
            .join(Cases, Bail.caseid == Cases.caseid)
            .join(t_caselawyeraccess, t_caselawyeraccess.c.caseid == Cases.caseid)
            .filter(t_caselawyeraccess.c.lawyerid == lawyer.lawyerid)
            .first()
        )

        if not bail:
            return jsonify({'message': 'No bail found for this lawyer'}), 404

        surety = bail.surety
        if not surety:
            return jsonify({'message': 'Surety not found for the bail'}), 404

        # 🧠 Query the Cases table directly to get the case title
        case = db.query(Cases).filter_by(caseid=bail.caseid).first()
        case_title = case.title if case else 'Unknown'

        return jsonify({
            'suretyid': surety.suretyid,
            'firstname': surety.firstname,
            'lastname': surety.lastname,
            'cnic': surety.cnic,
            'phone': surety.phone,
            'email': surety.email,
            'address': surety.address,
            'pasthistory': surety.pasthistory,
            'casename': case_title
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()


@app.route('/api/surety/<int:surety_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Surety")
def delete_surety(surety_id):
    db = SessionLocal()
    try:
        surety = db.query(Surety).get(surety_id)
        if not surety:
            return jsonify({'message': 'Surety not found'}), 404

        db.delete(surety)
        db.commit()
        return jsonify({'message': 'Surety deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

        

@app.route('/api/cases/<int:case_id>/history', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "CaseHistory")
def add_case_history(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        action_taken = data.get('actiontaken')
        remarks = data.get('remarks')

        if not action_taken:
            return jsonify({'message': 'Action taken is required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Add a new history entry
        new_history = Casehistory(
            caseid=case_id,
            actiondate=datetime.date.today(),
            actiontaken=action_taken,
            remarks=remarks
        )
        db.add(new_history)
        db.commit()

        return jsonify({'message': 'Case history added successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/history/<int:history_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "CaseHistory")
def update_case_history(history_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        history = db.query(Casehistory).get(history_id)

        if not history:
            return jsonify({'message': 'History entry not found'}), 404

        history.actiontaken = data.get('actiontaken', history.actiontaken)
        history.remarks = data.get('remarks', history.remarks)
        history.updatedat = datetime.datetime.utcnow()

        db.commit()
        return jsonify({'message': 'Case history updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/history/<int:history_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "CaseHistory")
def delete_case_history(history_id):
    db = SessionLocal()
    try:
        history = db.query(Casehistory).get(history_id)

        if not history:
            return jsonify({'message': 'History entry not found'}), 404

        db.delete(history)
        db.commit()
        return jsonify({'message': 'Case history deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
#Evidence API
@app.route('/api/cases/<int:case_id>/evidence', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Evidence")
def add_evidence(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        evidencetype = data.get('evidencetype')
        description = data.get('description')
        filepath = data.get('filepath')  # Path to the uploaded file
        submitteddate = data.get('submitteddate') or datetime.date.today()

        if not evidencetype or not description:
            return jsonify({'message': 'Evidence type and description are required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Add evidence
        new_evidence = Evidence(
            caseid=case_id,
            evidencetype=evidencetype,
            description=description,
            filepath=filepath,
            submitteddate=submitteddate
        )
        db.add(new_evidence)
        db.commit()

        return jsonify({'message': 'Evidence added successfully', 'evidence_id': new_evidence.evidenceid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/cases/<int:case_id>/evidence', methods=['GET'])
@login_required
def get_evidence_for_case(case_id):
    db = SessionLocal()
    try:
        evidence = db.query(Evidence).filter_by(caseid=case_id).all()
        result = [
            {
                'evidence_id': e.evidenceid,
                'evidencetype': e.evidencetype,
                'description': e.description,
                'filepath': e.filepath,
                'submitteddate': e.submitteddate.isoformat()
            }
            for e in evidence
        ]
        return jsonify({'evidence': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
        

@app.route('/api/lawyer/evidence', methods=['GET'])
@login_required
def get_evidence_for_logged_in_lawyer():
    db = SessionLocal()
    try:
        # 1. Get the logged-in user
        user = db.query(Users).filter_by(userid=current_user.userid).first()

        if not user or user.role != 'Lawyer':
            return jsonify({'message': 'Access denied: User is not a lawyer'}), 403

        # 2. Get the lawyer record
        lawyer = db.query(Lawyer).filter_by(userid=user.userid).first()
        if not lawyer:
            return jsonify({'message': 'Lawyer profile not found'}), 404

        # 3. Get all case IDs assigned to the lawyer
        case_ids = db.query(t_caselawyeraccess.c.caseid).filter(
            t_caselawyeraccess.c.lawyerid == lawyer.lawyerid
        ).all()
        case_ids = [cid[0] for cid in case_ids]

        if not case_ids:
            return jsonify({'message': 'No cases assigned to this lawyer'}), 404

        # 4. Get evidence for those cases
        evidence_entries = db.query(Evidence).filter(Evidence.caseid.in_(case_ids)).all()

        result = [
            {
                'evidence_id': e.evidenceid,
                'case_id': e.caseid,
                'evidencetype': e.evidencetype,
                'description': e.description,
                'filepath': e.filepath,
                'submitteddate': e.submitteddate.isoformat() if e.submitteddate else None
            }
            for e in evidence_entries
        ]

        return jsonify({'evidence': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/evidence/<int:evidence_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "Evidence")
def update_evidence(evidence_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        evidence = db.query(Evidence).get(evidence_id)

        if not evidence:
            return jsonify({'message': 'Evidence not found'}), 404

        evidence.evidencetype = data.get('evidencetype', evidence.evidencetype)
        evidence.description = data.get('description', evidence.description)
        evidence.filepath = data.get('filepath', evidence.filepath)
        evidence.submitteddate = data.get('submitteddate', evidence.submitteddate)

        db.commit()
        return jsonify({'message': 'Evidence updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/evidence', methods=['GET'])
def get_evidence():
    db = SessionLocal()
    try:
        # Step 1: Get the current user's userid (assuming you have current user id in session)
        userid = current_user.userid  # Implement this method to get the logged-in user's ID

        # Step 2: Get the court_id from the courtregistrar (assuming there's a `CourtRegistrar` model)
        court_registrar = db.query(Courtregistrar).filter_by(userid=userid).first()

        if not court_registrar:
            return jsonify({'message': 'CourtRegistrar not found'}), 404

        # Step 3: Get the courtId associated with the CourtRegistrar
        court_id = court_registrar.courtid

        # Step 4: Fetch court access cases related to the courtId using the manually defined table (t_courtaccess)
        court_access_cases = db.execute(
            t_courtaccess.select().filter_by(courtid=court_id)
        ).fetchall()

        if not court_access_cases:
            return jsonify({"error": "No cases found for this court"}), 404

        # Extract case IDs from court access cases (access by index, assuming 'case_id' is the first element)
        case_ids = [case[0] for case in court_access_cases]  # Assuming case_id is the first column

        # Step 5: Fetch evidence linked to these case IDs
        evidence_list = db.query(Evidence).join(Cases).filter(Cases.caseid.in_(case_ids)).all()

        # Prepare the response
        result = []
        for e in evidence_list:
            result.append({
                "id": e.evidenceid,
                "evidenceType": e.evidencetype,
                "description": e.description,
                "submissionDate": e.submitteddate.strftime('%Y-%m-%d') if e.submitteddate else None,
                "caseName": e.cases.title if e.cases else None,
                # "lawyerName": e.cases.lawyername if e.cases else None,
                "file": e.filepath
            })

        return jsonify({"evidence": result})

    except Exception as ex:
        # Print the full error traceback for debugging
        print("Error: ", ex)
        print("Full traceback: ", traceback.format_exc())
        return jsonify({"error": "Failed to fetch evidence"}), 500
    finally:
        db.close()


@app.route('/api/evidence/<int:evidence_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Evidence")
def delete_evidence(evidence_id):
    db = SessionLocal()
    try:
        evidence = db.query(Evidence).get(evidence_id)
        if not evidence:
            return jsonify({'message': 'Evidence not found'}), 404

        db.delete(evidence)
        db.commit()
        return jsonify({'message': 'Evidence deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
#Witness API
@app.route('/api/cases/<int:case_id>/witnesses', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Witnesses")
def add_witness(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        cnic = data.get('cnic')
        phone = data.get('phone')
        email = data.get('email')
        address = data.get('address')
        statement = data.get('statement')
        statementdate = data.get('statementdate') or datetime.date.today()

        if not firstname or not lastname:
            return jsonify({'message': 'First name and last name are required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Add witness
        new_witness = Witnesses(
            firstname=firstname,
            lastname=lastname,
            cnic=cnic,
            phone=phone,
            email=email,
            address=address,
            pasthistory=statement
        )
        db.add(new_witness)
        db.flush()

        # Link witness to the case
        witness_case = Witnesscase(
            caseid=case_id,
            witnessid=new_witness.witnessid,
            statement=statement,
            statementdate=statementdate
        )
        db.add(witness_case)
        db.commit()

        return jsonify({'message': 'Witness added successfully', 'witness_id': new_witness.witnessid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/<int:case_id>/witnesses', methods=['GET'])
@login_required
def get_witnesses_for_case(case_id):
    db = SessionLocal()
    try:
        witnesses = (
            db.query(Witnesscase)
            .filter_by(caseid=case_id)
            .join(Witnesses, Witnesscase.witnessid == Witnesses.witnessid)
            .all()
        )
        result = [
            {
                'witness_id': w.witnessid,
                'firstname': w.firstname,
                'lastname': w.lastname,
                'cnic': w.cnic,
                'phone': w.phone,
                'email': w.email,
                'address': w.address,
                'statement': w.statement,
                'statementdate': w.statementdate.isoformat()
            }
            for w in witnesses
        ]
        return jsonify({'witnesses': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
        
@app.route('/api/witnesses', methods=['GET'])
@login_required
def get_all_witnesses():
    db = SessionLocal()
    try:
        witnesses = db.query(Witnesses).all()
        if not witnesses:
            return jsonify({'message': 'No witnesses found'}), 404

        result = []
        for witness in witnesses:
            # Get all witness-case relationships
            witness_cases = db.query(Witnesscase).filter_by(witnessid=witness.witnessid).all()

            # Return one or many case records per witness
            if not witness_cases:
                result.append({
                    'witness': {
                        'id': witness.witnessid,
                        'firstname': witness.firstname,
                        'lastname': witness.lastname,
                        'cnic': witness.cnic,
                        'phone': witness.phone,
                        'email': witness.email,
                        'address': witness.address,
                        'pasthistory': witness.pasthistory,
                    },
                    'cases': []
                })
            else:
                for wc in witness_cases:
                    result.append({
                        'witness': {
                            'id': witness.witnessid,
                            'firstname': witness.firstname,
                            'lastname': witness.lastname,
                            'cnic': witness.cnic,
                            'phone': witness.phone,
                            'email': witness.email,
                            'address': witness.address,
                            'pasthistory': witness.pasthistory,
                        },
                        'case_id': wc.caseid,
                        'statement': wc.statement,
                        'statementdate': wc.statementdate
                    })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/witnesses/court', methods=['GET'])
@login_required
def get_court_specific_witnesses():
    db = SessionLocal()
    try:
        # Step 1: Get the current user's courtregistrar_id (assuming you have current user id in session)
        userid = current_user.userid  # Implement this method to get the logged-in user's ID

        # Step 2: Get the court_id from the courtregistrar (assuming there's a `CourtRegistrar` model)
        court_registrar = db.query(Courtregistrar).filter_by(userid=userid).first()

        if not court_registrar:
            return jsonify({'message': 'CourtRegistrar not found'}), 404

        # Step 3: Get the courtId associated with the CourtRegistrar
        court_id = court_registrar.courtid

        # Step 4: Fetch court access cases related to the courtId using the manually defined table (t_courtaccess)
        court_access_cases = db.query(t_courtaccess.c.caseid).filter_by(courtid=court_id).all()

        if not court_access_cases:
            return jsonify({"error": "No cases found for this court"}), 404

        # Extract case IDs from court access cases
        case_ids = [case.caseid for case in court_access_cases]  # Accessing attribute of the result object

        # Step 5: Fetch all witnesses associated with these case IDs
        witness_cases = db.query(Witnesscase).filter(Witnesscase.caseid.in_(case_ids)).all()

        # If no witness cases found
        if not witness_cases:
            return jsonify({"message": "No witnesses found for these cases"}), 404

        # Fetching the unique witnesses from witness_cases
        witness_ids = {wc.witnessid for wc in witness_cases}
        witnesses = db.query(Witnesses).filter(Witnesses.witnessid.in_(witness_ids)).all()

        # Prepare the response
        result = []
        for witness in witnesses:
            # Get all witness-case relationships for this witness
            related_cases = [wc for wc in witness_cases if wc.witnessid == witness.witnessid]

            # Return the cases for this witness
            case_data = []
            for wc in related_cases:
                case_data.append({
                    'case_id': wc.caseid,
                    'statement': wc.statement,
                    'statementdate': wc.statementdate
                })

            result.append({
                'witness': {
                    'id': witness.witnessid,
                    'firstname': witness.firstname,
                    'lastname': witness.lastname,
                    'cnic': witness.cnic,
                    'phone': witness.phone,
                    'email': witness.email,
                    'address': witness.address,
                    'pasthistory': witness.pasthistory,
                },
                'cases': case_data
            })

        return jsonify(result), 200

    except Exception as e:
        # Log the error and return a message
        print(f"Error: {e}")
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()




@app.route('/api/witnesses/<int:witness_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Witnesses")
def delete_witness(witness_id):
    db = SessionLocal()
    try:
        witness = db.query(Witnesses).get(witness_id)
        if not witness:
            return jsonify({'message': 'Witness not found'}), 404

        db.delete(witness)
        db.commit()
        return jsonify({'message': 'Witness deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
# CaseDocument API
@app.route('/api/cases/<int:case_id>/documents', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE (upload a doc)", entity_type = "Documents")
def upload_case_document(case_id):
    db = SessionLocal()
    try:
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        file.save(filepath)

        document = Documentcase(
            caseid=case_id,
            documenttitle=filename,
            filepath=filepath,
            submissiondate=datetime.date.today()
        )
        db.add(document)
        db.commit()
        return jsonify({'message': 'Document uploaded successfully', 'document_id': document.documentid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/cases/<int:case_id>/documents', methods=['GET'])
@login_required
def get_case_documents(case_id):
    db = SessionLocal()
    try:
        documents = db.query(Documentcase).filter_by(caseid=case_id).all()
        result = [
            {
                'document_id': d.documentid,
                'documenttitle': d.documenttitle,
                'filepath': d.filepath,
                'submissiondate': d.submissiondate.isoformat()
            }
            for d in documents
        ]
        return jsonify({'documents': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Documents")
def delete_case_document(document_id):
    db = SessionLocal()
    try:
        document = db.query(Documentcase).get(document_id)
        if not document:
            return jsonify({'message': 'Document not found'}), 404

        db.delete(document)
        db.commit()
        return jsonify({'message': 'Document deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

#FinalDecision API
@app.route('/api/cases/<int:case_id>/final-decision', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "FinalDecision")
def add_final_decision(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        decision_summary = data.get('decisionsummary')
        verdict = data.get('verdict')
        decision_date = data.get('decisiondate') or datetime.date.today()

        if not decision_summary or not verdict:
            return jsonify({'message': 'Decision summary and verdict are required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Add final decision
        final_decision = Finaldecision(
            caseid=case_id,
            decisionsummary=decision_summary,
            verdict=verdict,
            decisiondate=decision_date
        )
        db.add(final_decision)
        db.commit()

        return jsonify({'message': 'Final decision added successfully', 'decision_id': final_decision.decisionid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/cases/<int:case_id>/final-decision', methods=['GET'])
@login_required
def get_final_decision(case_id):
    db = SessionLocal()
    try:
        final_decision = db.query(Finaldecision).filter_by(caseid=case_id).first()
        if not final_decision:
            return jsonify({'message': 'Final decision not found'}), 404

        return jsonify({
            'decision_id': final_decision.decisionid,
            'case_id': final_decision.caseid,
            'decision_summary': final_decision.decisionsummary,
            'verdict': final_decision.verdict,
            'decision_date': final_decision.decisiondate.isoformat()
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
@app.route('/api/final-decision/<int:decision_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "FinalDecision")
def update_final_decision(decision_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        final_decision = db.query(Finaldecision).get(decision_id)

        if not final_decision:
            return jsonify({'message': 'Final decision not found'}), 404

        final_decision.decisionsummary = data.get('decisionsummary', final_decision.decisionsummary)
        final_decision.verdict = data.get('verdict', final_decision.verdict)
        final_decision.decisiondate = data.get('decisiondate', final_decision.decisiondate)

        db.commit()
        return jsonify({'message': 'Final decision updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

#Remand API
@app.route('/api/cases/<int:case_id>/remands', methods=['POST'])
@login_required
# @log_action(action_type = "CREATE", entity_type = "Remands")
def add_remand(case_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        start_date = data.get('startdate')
        end_date = data.get('enddate')
        remand_type = data.get('remandtype')
        remand_reason = data.get('remandreason')

        if not start_date or not end_date or not remand_type:
            return jsonify({'message': 'Start date, end date, and remand type are required'}), 400

        # Check if the case exists
        case = db.query(Cases).get(case_id)
        if not case:
            return jsonify({'message': 'Case not found'}), 404

        # Add remand
        new_remand = Remands(
            caseid=case_id,
            startdate=start_date,
            enddate=end_date,
            remandtype=remand_type,
            remandreason=remand_reason
        )
        db.add(new_remand)
        db.commit()

        return jsonify({'message': 'Remand added successfully', 'remand_id': new_remand.remandid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/cases/<int:case_id>/remands', methods=['GET'])
@login_required
def get_remands_for_case(case_id):
    db = SessionLocal()
    try:
        remands = db.query(Remands).filter_by(caseid=case_id).all()
        result = [
            {
                'remand_id': r.remandid,
                'start_date': r.startdate.isoformat(),
                'end_date': r.enddate.isoformat(),
                'remand_type': r.remandtype,
                'remand_reason': r.remandreason
            }
            for r in remands
        ]
        return jsonify({'remands': result}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/remands/<int:remand_id>', methods=['PUT'])
@login_required
# @log_action(action_type = "UPDATE", entity_type = "Remands")
def update_remand(remand_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        remand = db.query(Remands).get(remand_id)

        if not remand:
            return jsonify({'message': 'Remand not found'}), 404

        remand.startdate = data.get('startdate', remand.startdate)
        remand.enddate = data.get('enddate', remand.enddate)
        remand.remandtype = data.get('remandtype', remand.remandtype)
        remand.remandreason = data.get('remandreason', remand.remandreason)

        db.commit()
        return jsonify({'message': 'Remand updated successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()

@app.route('/api/remands/<int:remand_id>', methods=['DELETE'])
@login_required
# @log_action(action_type = "DELETE", entity_type = "Remands")
def delete_remand(remand_id):
    db = SessionLocal()
    try:
        remand = db.query(Remands).get(remand_id)
        if not remand:
            return jsonify({'message': 'Remand not found'}), 404

        db.delete(remand)
        db.commit()
        return jsonify({'message': 'Remand deleted successfully'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        db.close()
        
def check_case_access(case_id):
    db = SessionLocal()
    try:
        query = db.query(Cases).filter_by(caseid=case_id)

        if current_user.role == 'Lawyer':
            lawyer = db.query(Lawyer).filter_by(userid=current_user.userid).first()
            if not lawyer:
                return False
            query = query.filter(Cases.lawyerid == lawyer.lawyerid)

        elif current_user.role == 'CaseParticipant':
            participant = db.query(Caseparticipant).filter_by(userid=current_user.userid).first()
            if not participant:
                return False
            query = query.filter(Cases.caseid.in_(
                db.query(Caseparticipant.caseid).filter_by(userid=current_user.userid)
            ))

        elif current_user.role == 'CourtRegistrar':
            registrar = db.query(Courtregistrar).filter_by(userid=current_user.userid).first()
            if not registrar or not registrar.courtid:
                return False
            query = query.filter(Cases.caseid.in_(
                db.query(t_courtaccess.c.caseid).filter_by(courtid=registrar.courtid)
            ))

        return query.first() is not None
    finally:
        db.close()
@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        db = SessionLocal()
        
        # Querying the correct table LogTable
        logs = db.query(Logtable).all()
        
        # Serializing data
        logs_data = [
            {
                'logid': log.logid,
                'adminid': log.adminid,
                'actiontype': log.actiontype,
                'description': log.description,
                'status': log.status,
                'actiontimestamp': log.actiontimestamp,
                'entitytype': log.entitytype,
                'admin': {
                    'adminid': log.admin.adminid if log.admin else None,
                    'username': log.admin.username if log.admin else None,
                }
            }
            for log in logs
        ]
        return jsonify(logs_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
