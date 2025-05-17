import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Card, Row, Col, InputGroup, Form, Button, Badge, Table, Modal } from 'react-bootstrap';
import { User, PlusCircle, Search, LogOut } from 'lucide-react';
import SidebarNav from '../components/dashboard/SidebarNav';
import CalendarSummary from '../components/dashboard/CalendarSummary';
import DocumentManagement from '../components/dashboard/DocumentManagement';
import Notifications from '../components/dashboard/Notifications';
import Billing from '../components/dashboard/Billing';
import Appeals from '../components/dashboard/Appeals';
import Bail from './Bail.jsx';
import Surety from './Surety.jsx';
import Evidence from './Evidence.jsx';
import Witnesses from './Witnesses.jsx';

const PROFILE_IMAGE_KEY = 'lawyerProfileImage';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('cases');
  const [profileImage, setProfileImage] = useState(null);
  const [lawyerData, setLawyerData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackWarning, setFallbackWarning] = useState('');
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [caseHistory, setCaseHistory] = useState([]);
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    caseType: '',
    clientName: '',
    judgeName: ''
  });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCase, setHistoryCase] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionCase, setDecisionCase] = useState(null);

  const remands = [
    { caseName: 'State v. Smith', clientName: 'Jane Smith', status: 'Active' },
    { caseName: 'People v. Doe', clientName: 'John Doe', status: 'Completed' }
  ];

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = 
      case_.title.toLowerCase().includes(search.toLowerCase()) ||
      case_.caseType.toLowerCase().includes(search.toLowerCase()) ||
      case_.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === 'All' || case_.status === status;
    return matchesSearch && matchesStatus;
  });

useEffect(() => {
  const fetchCaseHistory = async () => {
    if (historyCase) {
      try {
        const res = await fetch(`/api/cases/${historyCase.id}/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!res.ok) throw new Error('Failed to fetch case history');

        const data = await res.json();

        // Check if history data exists and is in the expected format
        if (data && Array.isArray(data.history)) {
          setCaseHistory(data.history);
        } else {
          setCaseHistory([]); // Set to empty array if data is invalid
        }
      } catch (err) {
        console.error('Failed to fetch case history:', err);
        setCaseHistory([]); // Set to empty array on error
      }
    }
  };

  if (showHistoryModal && historyCase) {
    fetchCaseHistory();
  }
}, [showHistoryModal, historyCase]);  


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
        setFallbackWarning('Backend unavailable, showing mock data.');
        setLawyerData({ username: 'Mock Lawyer', specialization: 'Civil Law' });
        setProfileImage('https://via.placeholder.com/40');
        setPayments([
          { paymenttype: 'Court Fee', purpose: 'Filing', balance: 1000, mode: 'Cash', paymentdate: '2024-06-01' }
        ]);
      }
    };

    const fetchCases = async () => {
  try {
    const res = await fetch('/api/cases', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
      },
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to fetch cases');

    const data = await res.json();

    if (data && Array.isArray(data.cases)) {
      // Normalize keys to match your frontend expectations
      const normalizedCases = data.cases.map(c => ({
        id: c.caseid,
        title: c.title,
        description: c.description,
        caseType: c.casetype,
        filingDate: c.filingdate,
        status: c.status,
        clientName: c.clientname || 'N/A',
        courtName: c.courtname || 'N/A',
        judgeName: c.judgeName || 'N/A',
        decisionDate: c.decisiondate || '',
        decisionSummary: c.decisionsummary || '',
        verdict: c.verdict || '',
        history: c.history || [],
        remandStatus: c.remandstatus || '',
        prosecutor:c.prosecutorName || 'N/A'
      }));
      setCases(normalizedCases);
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (err) {
    setFallbackWarning(prev => prev + '\nFailed to fetch live cases. Using mock data.');
    setCases([
      {
        id: 1,
        title: 'State v. Smith',
        description: 'Criminal case involving theft',
        caseType: 'Criminal',
        filingDate: '2024-01-15',
        status: 'Open',
        prosecutor: 'Alex Mason',
        lawyerName: 'John Doe',
        clientName: 'Jane Smith',
        courtName: 'Metropolis Central Courthouse',
        judgeName: 'Judge Judy',
        decisionDate: '',
        decisionSummary: '',
        verdict: '',
        history: [
          { date: '2024-01-15', event: 'Case filed' },
          { date: '2024-02-01', event: 'First hearing' }
        ]
      }
    ]);
  } finally {
    setLoading(false);
  }
};

    fetchLawyerData();
    fetchCases();
  }, []);

  const handleProfileClick = () => navigate('/profile');

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
const handleCaseSubmit = async (e) => {
  e.preventDefault(); // Prevent the default form submission
  const token = localStorage.getItem('userToken');
  
  // Prepare the data to send
  const caseData = {
    title: caseForm.title,
    description: caseForm.description,
    casetype: caseForm.caseType,
    clientName: caseForm.clientName,
    judgeName: caseForm.judgeName,
  };

  try {
    let res;

    if (editingCase) {
      // PUT request for editing an existing case
      res = await fetch(`/api/cases/${editingCase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
      });
    } else {
      // POST request for creating a new case
      res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
      });
    }

    if (!res.ok) throw new Error('Failed to submit the case');

    const data = await res.json();

    if (editingCase) {
      // Update the case in the state if editing
      setCases(prevCases =>
        prevCases.map(c => (c.id === editingCase.id ? { ...c, ...caseData } : c))
      );
    } else {
      // Add the new case to the state if it's a new case
      const addedCase = {
        caseid: data.case_id, // case_id returned from the backend
        title: caseForm.title,
        description: caseForm.description,
        casetype: caseForm.caseType,
        clientName: caseForm.clientName,
        judgeName: caseForm.judgeName,
        status: 'Open',
        filingdate: new Date().toISOString().split('T')[0],
      };

      setCases([addedCase, ...cases]);
    }

    // Close the modal and reset the form
    setShowCaseModal(false);
    setEditingCase(null);
    setCaseForm({
      title: '',
      description: '',
      caseType: '',
      clientName: '',
      judgeName: '',
    });
  } catch (err) {
    console.error('Error submitting case:', err);
  }
};



  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeView) {
      case 'cases':
        return (
          <Card className="mb-4">
            <Card.Header className="bg-white border-bottom-0 pb-0">
              <div className="d-flex align-items-center gap-3 mb-2">
                <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="cases">📋</span>My Cases</h4>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="d-flex align-items-center gap-2"
                  onClick={() => setShowCaseModal(true)}
                >
                  <PlusCircle size={16} /> Add New Case
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-2 mb-3">
                <Col md={8}>
                  <InputGroup>
                    <InputGroup.Text><Search size={16} /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search by case name, type, or description..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </Col>
              </Row>
              <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Case Name</th>
                      <th>Type</th>
                      <th>Filing Date</th>
                      <th>Client</th>
                      <th>Prosecutor</th>
                      <th>Court</th>
                      <th>Judge</th>
                      <th>Status</th>
                      <th>Remand Status</th>
                      <th>Final Decision</th>
                      <th>Case History</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center text-muted py-4">No cases found.</td>
                      </tr>
                    ) : (
                      filteredCases.map((case_) => {
                        const remand = remands.find(r => r.caseName === case_.title && r.clientName === case_.clientName);
                        return (
                          <tr key={case_.id}>
                            <td>{case_.title}</td>
                            <td>{case_.caseType}</td>
                            <td>{case_.filingDate}</td>
                            <td>{case_.clientName}</td>
                            <td>{case_.prosecutor}</td>
                            <td>{case_.courtName}</td>
                            <td>{case_.judgeName}</td>
                            <td>
                              <Badge bg={
                                case_.status === 'Open' ? 'success' :
                                case_.status === 'Pending' ? 'warning' :
                                'secondary'
                              } className="px-3 py-1 fs-6">
                                {case_.status}
                              </Badge>
                            </td>
                            <td>
  {case_.remandStatus ? (
    <Badge bg={case_.remandStatus === 'Active' ? 'info' : 'secondary'}>
      {case_.remandStatus === 'Active' ? 'Remand Active' : 'Remand Completed'}
    </Badge>
  ) : (
    <span className="text-muted">-</span>
  )}
</td>

<td>
  {case_.status === 'Closed' && (case_.decisionDate || case_.decisionSummary || case_.verdict) ? (
    <Button
      variant="link"
      size="sm"
      onClick={() => {
        setDecisionCase(case_);
        setShowDecisionModal(true);
      }}
    >
      View
    </Button>
  ) : (
    <span className="text-muted">-</span>
  )}
</td>

                            <td>
                              <Button variant="link" size="sm" onClick={() => { setHistoryCase(case_); setShowHistoryModal(true); }}>View</Button>
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => {
                                  setEditingCase(case_);
                                  setCaseForm(case_);
                                  setShowCaseModal(true);
                                }}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
      case 'calendar':
        return <CalendarSummary />;
      case 'documents':
        return <DocumentManagement />;
      case 'billing':
        return <Billing payments={payments} onCreatePayment={createPayment} />;
      case 'appeals':
        return <Appeals />;
      case 'bail':
        return <Bail />;
      case 'surety':
        return <Surety />;
      case 'evidence':
        return <Evidence />;
      case 'witnesses':
        return <Witnesses />;
      default:
        return null;
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
      {fallbackWarning && (
        <div className="alert alert-warning text-center">{fallbackWarning}</div>
      )}
      <div className="dashboard-header-gradient p-3" style={{ flex: '0 0 auto', background: 'linear-gradient(90deg, #22304a 0%, #1ec6b6 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0" style={{ color: '#fff', fontWeight: 700 }}>Lawyer Dashboard</h4>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>|</span>
            <div className="d-flex align-items-center gap-2">
              <Image
                src={profileImage}
                roundedCircle
                width={40}
                height={40}
                className="border"
                style={{ borderColor: '#fff' }}
              />
              <div>
                <h6 className="mb-0" style={{ color: '#fff', fontWeight: 600 }}>{lawyerData?.username}</h6>
                <small style={{ color: 'rgba(255,255,255,0.85)' }}>{lawyerData?.specialization}</small>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Notifications color="#fff" />
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleProfileClick}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: '#fff', fontWeight: 600 }}
            >
              <User size={20} color="#fff" />
              Profile
            </button>
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2 logout-btn"
              onClick={handleLogout}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: '#fff', fontWeight: 600 }}
            >
              <LogOut size={20} color="#fff" />
              Logout
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

      <Modal show={showCaseModal} onHide={() => setShowCaseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCase ? 'Edit Case' : 'Add New Case'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCaseSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Case Title</Form.Label>
              <Form.Control
                type="text"
                value={caseForm.title}
                onChange={e => setCaseForm({ ...caseForm, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={caseForm.description}
                onChange={e => setCaseForm({ ...caseForm, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Case Type</Form.Label>
              <Form.Select
                value={caseForm.caseType}
                onChange={e => setCaseForm({ ...caseForm, caseType: e.target.value })}
                required
              >
                <option value="">Select type</option>
                <option value="Criminal">Criminal</option>
                <option value="Civil">Civil</option>
                <option value="Family">Family</option>
                <option value="Corporate">Corporate</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                value={caseForm.clientName}
                onChange={e => setCaseForm({ ...caseForm, clientName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Judge Name</Form.Label>
              <Form.Control
                type="text"
                value={caseForm.judgeName}
                onChange={e => setCaseForm({ ...caseForm, judgeName: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCaseModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingCase ? 'Update' : 'Add'} Case</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDecisionModal} onHide={() => setShowDecisionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Final Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {decisionCase && (
            <>
              <div><strong>Decision Date:</strong> {decisionCase.decisionDate || '-'}</div>
              <div><strong>Summary:</strong> {decisionCase.decisionSummary || '-'}</div>
              <div><strong>Verdict:</strong> {decisionCase.verdict || '-'}</div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDecisionModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Case History</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {caseHistory.length > 0 ? (
      <ul>
        {caseHistory.map((h, idx) => (
          <li key={idx}><strong>{h.date}:</strong> {h.event}</li>
        ))}
      </ul>
    ) : (
      <div className="text-center text-muted">No history available for this case.</div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
  </Modal.Footer>
</Modal>

      <style>{`
        .dashboard-heading, .dashboard-gradient, .modal-title, .card-title, .card-header h4, .card-header h5, h4.fw-bold, h5.fw-bold {
          background: linear-gradient(90deg, #22304a 0%, #1ec6b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .btn-primary, .btn-outline-primary, .btn-link, .btn-info, .btn-success, .btn-warning {
          background: #1ec6b6 !important;
          border-color: #1ec6b6 !important;
          color: #fff !important;
        }
        .btn-primary:hover, .btn-outline-primary:hover, .btn-link:hover, .btn-info:hover, .btn-success:hover, .btn-warning:hover {
          background: #159e8c !important;
          border-color: #159e8c !important;
          color: #fff !important;
        }
        .badge-success, .badge-info, .badge-warning, .badge-secondary {
          background: #1ec6b6 !important;
          color: #fff !important;
        }
        .table thead th {
          color: #22304a !important;
          font-weight: 700;
        }
        .text-primary, .text-info, .text-success, .text-warning, .text-secondary {
          color: #1ec6b6 !important;
        }
        .text-muted {
          color: #6c757d !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;