from flask_login import UserMixin

# In real apps, use SQLAlchemy or a DB
users = {}

class User(UserMixin):
    def __init__(self, id, username, password_hash, role):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.role = role

    def get_id(self):
        return self.id
