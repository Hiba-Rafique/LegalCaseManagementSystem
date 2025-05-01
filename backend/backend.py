from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)

# Allow dynamic origin + credentials
CORS(app, supports_credentials=True)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root1",
        password="your_password",
        database="lcms"
    )

@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    origin = request.headers.get('Origin')
    headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    data = request.get_json(force=True)
    FirstName = data.get("FirstName", "").strip()
    password = data.get("password", "")
    role = data.get("role", "")

    if not (FirstName and password and role):
        return jsonify(success=False, message="Missing required fields"), 400, headers

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM users WHERE FirstName = %s", (FirstName,))
        if cursor.fetchone():
            return jsonify(success=False, message="Username already exists."), 409, headers

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute(
            "INSERT INTO users (FirstName, password, role) VALUES (%s, %s, %s)",
            (FirstName, hashed, role)
        )
        conn.commit()

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify(success=False, message="Database error."), 500, headers

    finally:
        cursor.close()
        conn.close()

    return jsonify(success=True, message="Signup successful."), 201, headers




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
