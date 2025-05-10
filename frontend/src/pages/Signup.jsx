import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import '../styles/Signup.css'; // We will add custom CSS here
import legalSignupImage from '../assets/legal-signup.png'; // Background image
import legalLoginImage from '../assets/legal-login.png'; // Use as logo at the top
import { Eye, EyeOff } from 'lucide-react';

const roles = [
  'Client',
  'Court Registrar',
  'Lawyer',
  'Judge',
  'Admin'
];

const steps = [
  {
    label: 'Personal Info',
    fields: [
      { name: 'firstname', label: 'First Name', type: 'text', placeholder: 'Jane', required: true },
      { name: 'lastname', label: 'Last Name', type: 'text', placeholder: 'Doe', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true }
    ]
  },
  {
    label: 'Contact Info',
    fields: [
      { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', required: true },
      { name: 'phoneno', label: 'Phone Number', type: 'tel', placeholder: '123-456-7890', required: true },
      { name: 'cnic', label: 'CNIC', type: 'text', placeholder: '12345-1234567-1', required: true }
    ]
  },
  {
    label: 'Account Info',
    fields: [
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters', required: true },
      { name: 'role', label: 'Role', type: 'select', options: roles, required: true }
    ]
  }
];

const Signup = () => {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    role: '',
    phoneno: '',
    cnic: '',
    dob: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);
  const isPasswordStrong = (password) => password.length >= 8;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    setError(null);
    for (const field of steps[step].fields) {
      const value = form[field.name];
      if (field.required && (!value || value.trim() === '')) {
        setError(`${field.label} is required.`);
        return false;
    }
      if (field.name === 'email' && value && !isEmailValid(value)) {
      setError('Please enter a valid email address.');
        return false;
    }
      if (field.name === 'password' && value && !isPasswordStrong(value)) {
      setError('Password must be at least 8 characters long.');
        return false;
    }
      if (field.name === 'firstname' && value && value.trim().length < 2) {
        setError('First name must be at least 2 characters.');
        return false;
      }
      if (field.name === 'lastname' && value && value.trim().length < 2) {
        setError('Last name must be at least 2 characters.');
        return false;
    }
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (response.ok) {
        // Success: maybe navigate to complete profile or dashboard
      } else {
        setError(result.message || 'Signup failed.');
        setIsLoading(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/complete-profile', { state: { role: form.role } });
    } catch (apiError) {
      setError('Signup failed. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <div className="signup-form-card" style={{ maxWidth: 420, width: '100%', padding: '2.2em 1.2em 1.5em 1.2em', margin: '2em 0' }}>
        <img src={legalLoginImage} alt="LegalEase Logo" className="signup-logo" />
        <h2>Sign Up for LegalEase</h2>
        <p className="text-muted">Create your account to manage cases, clients, and more.</p>
        <div className="mb-3 w-100 d-flex justify-content-center align-items-center gap-2">
          {steps.map((s, idx) => (
            <div key={s.label} style={{width: 18, height: 18, borderRadius: '50%', background: idx === step ? '#2563eb' : '#e0e7ef', border: '2px solid #2563eb', display: 'inline-block'}}></div>
          ))}
  </div>
        <h5 className="mb-3">{steps[step].label}</h5>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
        <Form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext} style={{width: '100%'}}>
          {steps[step].fields.map(field => (
            <Form.Group className="mb-3" key={field.name}>
              <Form.Label>{field.label} {field.required && <span style={{color: 'red'}}>*</span>}</Form.Label>
              {field.type === 'select' ? (
                <Form.Select
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  aria-required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options && field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              ) : field.type === 'password' ? (
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder={field.placeholder}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    aria-required={field.required}
                    style={{ paddingRight: 40 }}
                  />
                  <span
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }}
                    tabIndex={0}
                    role="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
              ) : (
                <Form.Control
                  type={field.type}
                  placeholder={field.placeholder}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  aria-required={field.required}
                />
              )}
            </Form.Group>
          ))}
          <div className="d-flex justify-content-between align-items-center mt-3">
            {step > 0 && (
              <Button variant="secondary" onClick={handleBack} disabled={isLoading} type="button">Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button variant="primary" type="submit" className="ms-auto" disabled={isLoading}>Next</Button>
            ) : (
              <Button variant="primary" type="submit" className="ms-auto" disabled={isLoading}>
          {isLoading ? (
                  <><Spinner animation="border" size="sm" className="me-2" /> Signing Up...</>
          ) : (
            'Sign Up'
          )}
        </Button>
            )}
          </div>
      </Form>
      <p className="mt-3 text-center">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  </div>
  );
};

export default Signup;
