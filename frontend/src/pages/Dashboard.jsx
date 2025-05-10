import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import { User } from 'lucide-react';
import SidebarNav from '../components/dashboard/SidebarNav';
import CaseOverview from '../components/dashboard/CaseOverview';
import CalendarSummary from '../components/dashboard/CalendarSummary';
import DocumentManagement from '../components/dashboard/DocumentManagement';
import Notifications from '../components/dashboard/Notifications';
import Billing from '../components/dashboard/Billing';
import Appeals from '../components/dashboard/Appeals';

const PROFILE_IMAGE_KEY = 'lawyerProfileImage';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('cases');
  const [profileImage, setProfileImage] = useState(null);
  const [lawyerData, setLawyerData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyerData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch lawyer data');

        const result = await response.json();

        if (result.success) {
          setLawyerData(result.user);
          const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
          setProfileImage(storedImage || 'https://via.placeholder.com/40');

          const paymentRes = await fetch('/api/payments', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            },
            credentials: 'include',
          });

          if (paymentRes.ok) {
            const paymentData = await paymentRes.json();
            if (paymentData.status === 'success') {
              setPayments(paymentData.payments);
            }
          }
        } else {
          setError('Failed to load user data.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching lawyer data');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerData();
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const createPayment = async (newPayment) => {
  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
      },
      credentials: 'include',
      body: JSON.stringify(newPayment),
    });

    const result = await res.json();

    if (res.ok && result.message) {
      const addedPayment = {
        paymentdate: newPayment.paymentdate || new Date().toISOString().split('T')[0],
        casename: newPayment.casename,
        purpose: newPayment.purpose,
        balance: newPayment.balance,
        mode: newPayment.mode
      };

      setPayments(prev => [...prev, addedPayment]);
    }
  } catch (error) {
    console.error('Error creating payment:', error);
  }
};


  const renderContent = () => {
    switch (activeView) {
      case 'cases':
        return <CaseOverview />;
      case 'calendar':
        return <CalendarSummary />;
      case 'documents':
        return <DocumentManagement />;
      case 'billing':
        return <Billing payments={payments} onCreatePayment={createPayment} />;
      case 'appeals':
        return <Appeals />;
      default:
        return <CaseOverview />;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
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
                <h6 className="mb-0">{lawyerData?.username}</h6>
                <small className="text-muted">{lawyerData?.specialization}</small>
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

      <div style={{ flex: '1 1 0', display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
        <div className="border-end bg-white" style={{ width: '250px', height: '100%', minHeight: 0, flex: '0 0 250px' }}>
          <SidebarNav activeView={activeView} onViewChange={setActiveView} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
