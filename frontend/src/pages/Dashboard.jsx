import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { User, Bell } from 'lucide-react';
import SidebarNav from '../components/dashboard/SidebarNav';
import CaseOverview from '../components/dashboard/CaseOverview';
import CalendarSummary from '../components/dashboard/CalendarSummary';
import DocumentManagement from '../components/dashboard/DocumentManagement';
import Notifications from '../components/dashboard/Notifications';

const PROFILE_IMAGE_KEY = 'lawyerProfileImage';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('cases');
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  // Replace mock lawyerData with data from localStorage (or fallback)
  const getLawyerData = () => {
    const stored = localStorage.getItem('lawyerProfileData');
    if (stored) {
      const data = JSON.parse(stored);
      return {
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'John Smith',
        specialization: data.specialization || 'Corporate Law',
        barLicense: data.barLicense || 'BAR-2023-12345',
      };
    }
    // fallback
    return {
      name: 'John Smith',
      specialization: 'Corporate Law',
      barLicense: 'BAR-2023-12345',
    };
  };
  const [lawyerData, setLawyerData] = useState(getLawyerData());

  useEffect(() => {
    // Load profile image from localStorage if available
    const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    setProfileImage(storedImage || 'https://via.placeholder.com/40');
    // Listen for storage changes (in case profile is updated in another tab)
    const handleStorage = () => {
      const updatedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
      setProfileImage(updatedImage || 'https://via.placeholder.com/40');
      setLawyerData(getLawyerData()); // update lawyer data if profile changes
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'cases':
        return <CaseOverview />;
      case 'calendar':
        return <CalendarSummary />;
      case 'documents':
        return <DocumentManagement />;
      default:
        return <CaseOverview />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="bg-white border-bottom p-3" style={{ flex: '0 0 auto' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0">Lawyer Dashboard</h4>
            <span className="text-muted">|</span>
            <div className="d-flex align-items-center gap-2">
              <Image
                src={profileImage}
                roundedCircle
                width={40}
                height={40}
                className="border"
              />
              <div>
                <h6 className="mb-0">{lawyerData.name}</h6>
                <small className="text-muted">{lawyerData.specialization}</small>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Notifications />
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleProfileClick}
            >
              <User size={20} />
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: '1 1 0', display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
        {/* Sidebar */}
        <div className="border-end bg-white" style={{ width: '250px', height: '100%', minHeight: 0, flex: '0 0 250px' }}>
          <SidebarNav activeView={activeView} onViewChange={setActiveView} />
        </div>
        {/* Content Area */}
        <div style={{ flex: 1, width: '100%', height: '100%', minHeight: 0, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
