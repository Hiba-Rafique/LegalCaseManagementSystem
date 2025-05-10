import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import '../styles/Signup.css';
import legalLoginImage from '../assets/legal-login.png';

const roleFieldMap = {
  'Client': [
    { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City', required: true }
  ],
  'Case Participant': [
    { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City', required: true }
  ],
  'CourtRegistrar': [
    { name: 'position', label: 'Position', type: 'text', placeholder: 'Registrar Position', required: true }
  ],
  'Lawyer': [
    { name: 'barLicense', label: 'Bar License No', type: 'text', placeholder: '123456', required: true },
    { name: 'experience', label: 'Experience (years)', type: 'number', placeholder: '5', required: true },
    { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Civil Law', required: true }
  ],
  'Judge': [
    { name: 'position', label: 'Position', type: 'text', placeholder: 'Judge Position', required: true },
    { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Criminal Law', required: true },
    { name: 'experience', label: 'Experience (years)', type: 'number', placeholder: '10', required: true }
  ]
};

const getRoleFields = (role) => {
  if (role === 'Client') return roleFieldMap['Case Participant'];
  return roleFieldMap[role] || [];
};

const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Assume role is passed via navigation state or fallback to 'Client'
  const role = location.state?.role || 'Client';
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);

  const fields = getRoleFields(role);

  const steps = [
    {
      label: 'Basic Info',
      content: (
        <div className="mb-3">
          <p><b>Role:</b> {role}</p>
          <p className="text-muted">Please complete your profile to continue.</p>
        </div>
      )
    },
    {
      label: 'Additional Info',
      fields: fields
    }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      for (const field of fields) {
        const value = form[field.name];
        if (field.required && (!value || value.trim() === '')) {
          setError('${field.label} is required.');
          return false;
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (response.ok) {
        // Success: maybe navigate to dashboard
      } else {
        setError(result.message || 'Profile completion failed.');
        setIsLoading(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (role === 'CourtRegistrar') {
        navigate('/registrar-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Profile completion failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <div className="signup-form-card" style={{ maxWidth: 420, width: '100%', padding: '2.2em 1.2em 1.5em 1.2em', margin: '2em 0' }}>
        <img src={legalLoginImage} alt="LegalEase Logo" className="signup-logo" />
        <h2>Complete Your Profile</h2>
        <p className="text-muted">Just one more step to get started!</p>
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
          {step === 0 && steps[0].content}
          {step === 1 && fields.map(field => (
            <Form.Group className="mb-3" key={field.name}>
              <Form.Label>{field.label} {field.required && <span style={{color: 'red'}}>*</span>}</Form.Label>
              <Form.Control
                type={field.type}
                placeholder={field.placeholder}
                name={field.name}
                value={form[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                aria-required={field.required}
              />
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
                  <><Spinner animation="border" size="sm" className="me-2" /> Completing...</>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CompleteProfile; 