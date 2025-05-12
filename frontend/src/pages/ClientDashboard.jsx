import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import { User } from 'lucide-react';
import ClientCases from '../components/ClientCases';
import ClientHearingSchedule from '../components/ClientHearingSchedule';
import ClientDocuments from '../components/ClientDocuments';
import Profile from '../components/ClientProfile';
import ClientSidebarNav from '../components/dashboard/ClientSidebarNav';
import 'bootstrap/dist/css/bootstrap.min.css';

const PROFILE_IMAGE_KEY = 'clientProfileImage';

function ClientDashboard() {
  const [activeSection, setActiveSection] = useState('cases');
  const [profileImage, setProfileImage] = useState(localStorage.getItem(PROFILE_IMAGE_KEY) || 'https://via.placeholder.com/40');
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setActiveSection('profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <div className="bg-white border-bottom p-3" style={{ flex: '0 0 auto' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <img src="/logo.png" alt="LegalEase" height="40" />
            <h4 className="mb-0">Client Dashboard</h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleProfileClick}
            >
              <User size={20} />
              Profile
            </button>
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              Logout
            </button>
            <div className="profile-image-container ms-2" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <Image
                src={profileImage}
                roundedCircle
                width={40}
                height={40}
                className="profile-image"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 0', display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
        {/* Sidebar */}
        <div className="border-end bg-white" style={{ width: '250px', height: '100%', minHeight: 0, flex: '0 0 250px' }}>
          <ClientSidebarNav activeView={activeSection} onViewChange={setActiveSection} />
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="container-fluid py-4">
            {activeSection === 'cases' && <ClientCases />}
            {activeSection === 'hearings' && <ClientHearingSchedule />}
            {activeSection === 'documents' && <ClientDocuments />}
            {activeSection === 'profile' && <Profile />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;