from functools import wraps
from datetime import datetime
from flask_login import current_user
from models import Logtable

def log_action(action_type, entity_type=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from app import SessionLocal 
            db = SessionLocal()
            status = "SUCCESS"
            description = ""
            try:
                # If entity_type is not provided, set it dynamically based on user role
                if not entity_type and current_user.is_authenticated:
                    role_to_entity = {
                        "courtregistrar": "CourtRegistrar",
                        "caseparticipant": "CaseParticipant",
                        "admin": "Admin",
                        "lawyer": "Lawyer",
                        "judge": "Judge"
                    }
                    entity_type = role_to_entity.get(current_user.role.lower(), "UnknownRole")

                # Run the original function
                response = func(*args, **kwargs)
                
                # Capture custom description if returned
                if isinstance(response, tuple) and isinstance(response[0], dict):
                    description = response[0].get("message", "")

                return response
            except Exception as e:
                db.rollback()
                status = "FAILED"
                description = str(e)
                raise
            finally:
                try:
                    # Generate a more descriptive log entry
                    action_type_lower = action_type.lower()

                    if action_type_lower == "create":
                        action_description = f"New {entity_type} created."
                    elif action_type_lower == "update":
                        action_description = f"{entity_type} updated."
                    elif action_type_lower == "delete":
                        action_description = f"{entity_type} deleted."
                    elif action_type_lower == "login":
                        action_description = f"{entity_type} logged in."
                    elif action_type_lower == "logout":
                        action_description = f"{entity_type} logged out."
                    elif action_type_lower == "signup":
                        action_description = f"New {entity_type} signed up."
                    elif action_type_lower == "profilecompleted":
                        action_description = f"{entity_type} completed profile."
                    else:
                        action_description = f"{action_type} action on {entity_type}"

                    # Log the action dynamically
                    log = Logtable(
                        adminid=current_user.userid,
                        actiontype=action_type,
                        entitytype=entity_type,
                        description=description or action_description,
                        status=status,
                        actiontimestamp=datetime.now()
                    )
                    db.add(log)
                    db.commit()
                except Exception as log_error:
                    db.rollback()
                    print("Failed to log action:", log_error)
                finally:
                    db.close()
        return wrapper
    return decorator
