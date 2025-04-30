import os

class Config:
    SECRET_KEY = 'your_secret_key_here'  # use os.urandom(24) for prod
    SESSION_TYPE = 'filesystem'
