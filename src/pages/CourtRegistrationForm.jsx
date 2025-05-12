import React from 'react';
import CourtRegistrationForm from '../components/CourtRegistrationForm';
import { useNavigate } from 'react-router-dom';

const CourtRegistrationPage = () => {
  const navigate = useNavigate();

  const handleCourtRegistration = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('courtRegistered', 'true');
    navigate('/RegistrarDashboard');
  };

  return (
    <div className="signup-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <CourtRegistrationForm onSubmit={handleCourtRegistration} />
    </div>
  );
};

export default CourtRegistrationPage; 