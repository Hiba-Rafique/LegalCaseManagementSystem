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
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (
      userType === 'lawyer' &&
      email === MOCK_LAWYER.email &&
      password === MOCK_LAWYER.password
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'lawyer');
      navigate('/dashboard');
    } else if (
      userType === 'registrar' &&
      email === MOCK_REGISTRAR.email &&
      password === MOCK_REGISTRAR.password
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'registrar');
      navigate('/registrar-dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      {/* Image on the left */}
      <div className="login-image-section">
        <img src={legalLoginImage} alt="Legal login" />
      </div>

      {/* Form on the right */}
      <div className="login-form-section">
        <div className="login-form-box">
          <h2>Welcome Back</h2>
          <p className="text-muted">Log in to your LegalEase account.</p>

          {/* Demo credentials info */}
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

          <Form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default Login;
