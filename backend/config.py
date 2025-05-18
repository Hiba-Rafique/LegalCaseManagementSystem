import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres.txnbgywnkaqgjspxumcp:Project_LCMS%402025@aws-0-ap-south-1.pooler.supabase.com:6543/postgres')
    SESSION_TYPE = os.getenv('SESSION_TYPE', 'filesystem')

