from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Adjust static folder to point to Vite build
app = Flask(__name__, static_folder="../lcms-frontend/dist", static_url_path="/")

# Allow dynamic origin + credentials
CORS(app, supports_credentials=True)

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

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
    role = data.get("role", "").capitalize()  # Capitalize role to match enum values

    if not (FirstName and password and role):
        return jsonify(success=False, message="Missing required fields"), 400, headers

    conn = None
    cursor = None

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

    except psycopg2.Error as err:
        print(f"Database error: {err}")
        return jsonify(success=False, message="Database error."), 500, headers

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    return jsonify(success=True, message="Signup successful."), 201, headers


# Serve static frontend from dist/
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    full_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
