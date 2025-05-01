// Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation after signup
import axios from 'axios';  // Importing Axios for HTTP requests
import 'bootstrap/dist/css/bootstrap.min.css';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to 'user'
    const [loading, setLoading] = useState(false); // To show loading state
    const [error, setError] = useState(null); // To store errors

    const navigate = useNavigate(); // To navigate to home page after signup

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError(null); 
        const formData = {
            username: username,
            password: password,
            role: role
        };

        try {
        
            const response = await axios.post('https://zkmv6wg4iq1s.share.zrok.io/signup', formData,
                {
                    withCredentials: true, // ⭐⭐ Add this ⭐⭐
                }
            );
            
        
            if (response.status === 200) {
                console.log('Signup successful:', response.data);
                navigate('/'); 
            }
        } catch (err) {
          
            console.error('Error during signup:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="container mt-5">
            <h1>Signup Page</h1>
            {error && <div className="alert alert-danger">{error}</div>} {/* Display error message */}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                        id="role"
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
}

export default Signup;
