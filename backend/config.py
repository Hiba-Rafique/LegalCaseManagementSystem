import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres.rxkukgwjlcqnejjqbsjc:db_project_123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres')
    SESSION_TYPE = os.getenv('SESSION_TYPE', 'filesystem')

