import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import '../styles/login.css';
import legalLoginImage from '../assets/legal-login.png';

// Mock credentials for lawyer and registrar
const MOCK_LAWYER = {
  email: 'lawyer@example.com',
  password: 'password123',
};
const MOCK_REGISTRAR = {
  email: 'registrar@example.com',
  password: 'registrar123',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('lawyer');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);

 const handleSubmit = async (event) => {
  event.preventDefault();
  setError(null);

  if (!email || !isEmailValid(email)) {
    setError('Please enter a valid email address.');
    return;
  }
  if (!password) {
    setError('Password is required.');
    return;
  }

  setIsLoading(true);
  try {
    // First, try the API login
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType }),
      credentials: 'include', // To include the session cookie
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // API login succeeded: store role from API response
      const { role } = result;
      localStorage.setItem('userRole', role);
      localStorage.setItem('email', result.email); // You can store email too if needed

      // Navigate to the appropriate dashboard based on the role
      if (role === 'Lawyer') {
        navigate('/dashboard');
      } else if (role === 'Registrar') {
        navigate('/registrar-dashboard');
      }
    } else {
      // Handle error from API
      setError(result.message || 'Login failed.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  } catch (apiError) {
    setError('Login failed. Please try again later.');
    setIsLoading(false);
  }
};

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <div className="signup-form-card" style={{ maxWidth: 420, width: '100%', padding: '2.2em 1.2em 1.5em 1.2em', margin: '2em 0', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', borderRadius: '1.5rem' }}>
        <img src={legalLoginImage} alt="LegalEase Logo" className="signup-logo" />
        <h2>Welcome Back</h2>
        <p className="text-muted">Log in to your LegalEase account.</p>
        <div className="mb-3">
          <div className="small text-muted mb-1">Demo Credentials:</div>
          <div className="small"><b>Lawyer</b>: lawyer@example.com / password123</div>
          <div className="small"><b>Court Registrar</b>: registrar@example.com / registrar123</div>
        </div>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} style={{width: '100%'}}>
          <Form.Group className="mb-3">
            <Form.Label>User Type</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="Lawyer"
                name="userType"
                id="userType-lawyer"
                value="lawyer"
                checked={userType === 'lawyer'}
                onChange={() => setUserType('lawyer')}
              />
              <Form.Check
                type="radio"
                label="Court Registrar"
                name="userType"
                id="userType-registrar"
                value="registrar"
                checked={userType === 'registrar'}
                onChange={() => setUserType('registrar')}
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Logging In...
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </Form>
        <p className="mt-3 text-center">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
