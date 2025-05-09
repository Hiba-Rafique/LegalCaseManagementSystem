import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import '../styles/Signup.css'; // We will add custom CSS here
import legalSignupImage from '../assets/legal-signup.png'; // Make sure this is a wide image

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);
  const isPasswordStrong = (password) => password.length >= 8;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!email || !isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || !isPasswordStrong(password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/login');
    } catch (apiError) {
      setError('Signup failed. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
<div className="signup-container">
  {/* Image on the left */}
  <div className="signup-image-section">
    <img src={legalSignupImage} alt="Legal signup" />
  </div>

  {/* Form on the right */}
  <div className="signup-form-section">
    <div className="signup-form-box">
      <h2>Create Account</h2>
      <p className="text-muted">Get started with LegalEase today.</p>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Signing Up...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </Form>

      <p className="mt-3 text-center">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  </div>
</div>

  );
};

export default Signup;
