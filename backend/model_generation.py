import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, create_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)

# Metadata for reflection
metadata = MetaData()

def reflect_db():
    engine = create_engine(os.getenv('DATABASE_URL'))  # Correct way to get engine
    metadata.reflect(bind=engine)

    models = {}
    for table_name in metadata.tables:
        table = metadata.tables[table_name]

        model = type(table_name.capitalize(), (db.Model,), {
            '__tablename__': table_name,
            '__table__': table,
        })

        models[table_name] = model

    return models

# Example usage
if __name__ == '__main__':
    models = reflect_db()
    print("Reflected Models:", list(models.keys()))
