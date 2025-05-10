import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, ListGroup, Nav, Badge, Tab, Toast, Spinner, InputGroup } from 'react-bootstrap';
import { Plus, Building2, Users, Gavel, Briefcase, DollarSign, UserCheck, FileText, Search, Trash2, Edit2, ArrowLeft, Bell, User, Eye, Mail, Phone, MapPin, Award, Upload, Edit3, Save } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import lawImage from '../assets/law.png'
import { useLocation } from 'react-router-dom';

// Mock data for demonstration
const mockJudges = [
  { id: 1, name: 'Judge Judy' },
  { id: 2, name: 'Judge Dredd' },
  { id: 3, name: 'Judge Amy' },
  { id: 4, name: 'Judge John' },
];
const mockProsecutors = [
  { id: 1, name: 'Alex Mason' },
  { id: 2, name: 'Sam Fisher' },
  { id: 3, name: 'Lara Croft' },
];
const mockCases = [
  { id: 1, title: 'State v. Smith' },
  { id: 2, title: 'People v. Doe' },
  { id: 3, title: 'Acme Corp v. Beta' },
];

// Mock court details for screenshot
const mockCourt = {
  name: 'Metropolis Central Courthouse',
  location: '123 Justice Avenue, Metropolis, MZ 12345',
  courtId: 'MCC-001',
  phone: '(555) 123-4567',
  email: 'registrar@metropoliscourts.gov',
  image: lawImage,
};
const mockActivity = [
  { activity: "New case #C2024-08-15-001 (State v. Byte) filed.", type: "Case", timestamp: "2024-08-15 09:30 AM" },
  { activity: "Court Room 3 schedule updated for hearings.", type: "Room", timestamp: "2024-08-14 04:15 PM" },
  { activity: "Appeal #A2024-007 (Smith v. Corp) hearing scheduled.", type: "Appeal", timestamp: "2024-08-14 02:00 PM" },
  { activity: "User 'johndoe_clerk' logged in.", type: "System", timestamp: "2024-08-15 08:00 AM" },
];

// Mock data for Court Rooms and Cases
const mockRooms = [
  { number: '101', name: 'Justice Hall A', capacity: 75, type: 'Trial Room', status: 'Available' },
  { number: '102', name: 'Deliberation Chamber', capacity: 30, type: 'Hearing Room', status: 'Occupied' },
  { number: '201', name: 'Mediation Suite', capacity: 15, type: 'Conference Room', status: 'Maintenance' },
  { number: '202', name: 'Justice Hall B', capacity: 75, type: 'Trial Room', status: 'Available' },
  { number: '301', name: ",Judge Miller's Chambers", capacity: 5, type: 'Chambers', status: 'Reserved' },
];

const RegistrarDashboard = () => {
  // Courts state
  const [courts, setCourts] = useState([]);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [courtForm, setCourtForm] = useState({ name: '', courtId: '', location: '', type: '' });
  const [editingCourt, setEditingCourt] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchCourt, setSearchCourt] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Court management state
  const [courtRooms, setCourtRooms] = useState([
    { id: 1, number: '101', name: 'Justice Hall A', capacity: 75, type: 'Trial Room', status: 'Available' },
    { id: 2, number: '102', name: 'Deliberation Chamber', capacity: 30, type: 'Hearing Room', status: 'Occupied' },
    { id: 3, number: '201', name: 'Mediation Suite', capacity: 15, type: 'Conference Room', status: 'Maintenance' },
    { id: 4, number: '202', name: 'Justice Hall B', capacity: 75, type: 'Trial Room', status: 'Available' },
    { id: 5, number: '301', name: ",Judge Miller's Chambers", capacity: 5, type: 'Chambers', status: 'Reserved' },
  ]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ number: '', name: '', capacity: '', type: '', status: '' });
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchRoom, setSearchRoom] = useState('');

  const [courtJudges, setCourtJudges] = useState([]);
  const [searchJudge, setSearchJudge] = useState('');
  const [courtProsecutors, setCourtProsecutors] = useState([]);
  const [searchProsecutor, setSearchProsecutor] = useState('');
  const [courtPayments, setCourtPayments] = useState([]);
  const [courtAppeals, setCourtAppeals] = useState([]);
  const [courtCases, setCourtCases] = useState([]);
  const [searchCase, setSearchCase] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);
  // Confirmation dialog state
  const [confirm, setConfirm] = useState({ show: false, type: '', payload: null });

  // Add state for tab selection
  const [selectedPage, setSelectedPage] = useState('dashboard');

  // Add state and handlers for appeals management at the top of the component
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState(null);
  const [appealForm, setAppealForm] = useState({ appealNumber: '', originalCaseId: '', appellant: '', respondent: '', dateFiled: '', status: '' });
  const [searchAppeal, setSearchAppeal] = useState('');
  const [appeals, setAppeals] = useState([
    { id: 1, appealNumber: 'AP-2024-0034', originalCaseId: 'CASE001', appellant: 'Johnathan Crane', respondent: 'State of Metropolis', dateFiled: '2024-07-01', status: 'Under Review' },
    { id: 2, appealNumber: 'AP-2024-0035', originalCaseId: 'CASE004', appellant: 'B. Allen', respondent: 'City of Central', dateFiled: '2024-07-15', status: 'Hearing Scheduled' },
    { id: 3, appealNumber: 'AP-2023-0190', originalCaseId: 'CV-2023-0815', appellant: 'Stark Industries', respondent: 'Pym Technologies', dateFiled: '2023-11-05', status: 'Decided' },
  ]);
  const filteredAppeals = appeals.filter(a =>
    a.appealNumber.toLowerCase().includes(searchAppeal.toLowerCase()) ||
    a.originalCaseId.toLowerCase().includes(searchAppeal.toLowerCase()) ||
    a.appellant.toLowerCase().includes(searchAppeal.toLowerCase()) ||
    a.respondent.toLowerCase().includes(searchAppeal.toLowerCase())
  );

  // Add state for modals and forms for rooms and cases
  const [showRoomViewModal, setShowRoomViewModal] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [caseForm, setCaseForm] = useState({ number: '', title: '', parties: '', type: '', status: '' });
  const [showCaseViewModal, setShowCaseViewModal] = useState(false);
  const [viewingCase, setViewingCase] = useState(null);
  const [cases, setCases] = useState([
    { id: 1, number: 'CASE001', title: 'State v. Smith', parties: 'State, Smith', type: 'Criminal', status: 'Open' },
    { id: 2, number: 'CASE002', title: 'People v. Doe', parties: 'People, Doe', type: 'Civil', status: 'Pending' },
    { id: 3, number: 'CASE003', title: 'Acme Corp v. Beta', parties: 'Acme, Beta', type: 'Corporate', status: 'Closed' },
  ]);
  const filteredCases = cases.filter(c =>
    c.number.toLowerCase().includes(searchCase.toLowerCase()) ||
    c.title.toLowerCase().includes(searchCase.toLowerCase()) ||
    c.parties.toLowerCase().includes(searchCase.toLowerCase())
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('registrarProfile');
    return saved ? JSON.parse(saved) : { name: '', email: '', phone: '', court: '' };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Add state for profile image
  const PROFILE_IMAGE_KEY = 'registrarProfileImage';
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem(PROFILE_IMAGE_KEY) || null);
  const fileInputRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    if (storedImage) setProfileImage(storedImage);
  }, []);

  useEffect(() => {
    // Always show registration form on mount
    setCourts([]);
    setSelectedCourt(null);
  }, [location.pathname]);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const triggerProfileImageUpload = () => fileInputRef.current.click();

  // Toast helpers
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: 'success' }), 2500);
  };

  
  const handleCourtFormChange = (e) => setCourtForm({ ...courtForm, [e.target.name]: e.target.value });
  const handleCourtSubmit = async (e) => {
  e.preventDefault();
  if (!courtForm.name.trim()) return;

  if (courts.length >= 1 && !editingCourt) {
    showToast('You can only register one court.', 'danger');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/court', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courtname: courtForm.name,
        location: courtForm.location,
        type: courtForm.type,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const newCourt = {
        id: data.courtid,
        name: data.court.name,
        location: data.court.location,
        type: data.court.type,
        rooms: [],
        judges: [],
        prosecutors: [],
        payments: [],
        appeals: [],
        cases: []
      };

      setCourts([newCourt]);
      setSelectedCourt(newCourt);
      setActiveTab('courtRooms');
      showToast('Court registered!');
      setCourtForm({ name: '', courtId: '', location: '', type: '' });
      setShowCourtModal(false);
      setEditingCourt(null);
    } else {
      showToast(data.detail || 'Failed to create court.', 'danger');
    }
  } catch (error) {
    showToast('Error connecting to server.', 'danger');
  } finally {
    setTimeout(() => {
    setLoading(false);
  }, 700);
}
  }

  const handleEditCourt = (court) => {
    setEditingCourt(court);
    setCourtForm({ name: court.name, courtId: court.courtId, location: court.location, type: court.type });
    setShowCourtModal(true);
  };
  const handleDeleteCourt = (court) => {
    setConfirm({ show: true, type: 'deleteCourt', payload: court });
  };
  const confirmDeleteCourt = () => {
    setCourts([]);
    setConfirm({ show: false, type: '', payload: null });
    showToast('Court deleted!', 'danger');
    setSelectedCourt(null);
    setActiveTab('dashboard');
  };

  // COURT SELECTION
  const handleSelectCourt = (court) => {
    setSelectedCourt(court);
    setCourtRooms(court.rooms || []);
    setCourtJudges(court.judges || []);
    setCourtProsecutors(court.prosecutors || []);
    setCourtPayments(court.payments || []);
    setCourtAppeals(court.appeals || []);
    setCourtCases(court.cases || []);
    setActiveTab('courtRooms');
  };

  // COURT ROOMS CRUD
  const handleRoomFormChange = (e) => setRoomForm({ ...roomForm, [e.target.name]: e.target.value });
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (editingRoom) {
        setCourtRooms(courtRooms.map(r => r.id === editingRoom.id ? { ...editingRoom, ...roomForm } : r));
        showToast('Room updated!');
      } else {
        setCourtRooms([...courtRooms, { ...roomForm, id: Date.now() }]);
        showToast('Room added!');
      }
      setRoomForm({ number: '', name: '', capacity: '', type: '', status: '' });
      setShowRoomModal(false);
      setEditingRoom(null);
      setLoading(false);
    }, 500);
  };
  const handleRoomView = (room) => { setViewingRoom(room); setShowRoomViewModal(true); };
  const handleRoomEdit = (room) => { setEditingRoom(room); setRoomForm({ ...room }); setShowRoomModal(true); };
  const handleRoomDelete = (room) => setConfirm({ show: true, type: 'deleteRoom', payload: room });
  const handleRoomAdd = () => { setEditingRoom(null); setRoomForm({ number: '', name: '', capacity: '', type: '', status: '' }); setShowRoomModal(true); };

  // JUDGES
  const handleAssignJudge = (judge) => {
    if (!courtJudges.find(j => j.id === judge.id)) setCourtJudges([...courtJudges, judge]);
  };
  const handleUnassignJudge = (judge) => setCourtJudges(courtJudges.filter(j => j.id !== judge.id));

  // PROSECUTORS
  const handleAssignProsecutor = (prosecutor) => {
    if (!courtProsecutors.find(p => p.id === prosecutor.id)) setCourtProsecutors([...courtProsecutors, prosecutor]);
  };
  const handleUnassignProsecutor = (prosecutor) => setCourtProsecutors(courtProsecutors.filter(p => p.id !== prosecutor.id));

  // PAYMENTS
  const handleAddPayment = () => {
    setCourtPayments([...courtPayments, { id: Date.now(), amount: Math.floor(Math.random()*1000)+100, date: new Date().toLocaleDateString() }]);
    showToast('Payment added!');
  };

  // APPEALS
  const handleAddAppeal = () => {
    setCourtAppeals([...courtAppeals, { id: Date.now(), title: `Appeal #${courtAppeals.length+1}` }]);
    showToast('Appeal added!');
  };

  // CASES
  const handleGrantCase = (courtCase) => {
    if (!courtCases.find(c => c.id === courtCase.id)) setCourtCases([...courtCases, courtCase]);
  };
  const handleRevokeCase = (courtCase) => setCourtCases(courtCases.filter(c => c.id !== courtCase.id));

  // Save changes to selected court
  const handleSaveCourt = () => {
    setCourts(courts.map(c => c.id === selectedCourt.id ? {
      ...selectedCourt,
      rooms: courtRooms,
      judges: courtJudges,
      prosecutors: courtProsecutors,
      payments: courtPayments,
      appeals: courtAppeals,
      cases: courtCases,
    } : c));
    setSelectedCourt(null);
    setActiveTab('dashboard');
    showToast('Court updated!');
  };

  // Add a helper to check if a court is registered
  const isCourtRegistered = courts.length === 1;

  // Sidebar navigation (dynamic based on registration)
  const navItems = isCourtRegistered
    ? [
        { key: 'dashboard', label: 'Dashboard', icon: <Building2 size={18} /> },
    { key: 'courtRooms', label: 'Court Rooms', icon: <Users size={18} /> },
        { key: 'cases', label: 'Cases', icon: <Briefcase size={18} /> },
    { key: 'appeals', label: 'Appeals', icon: <FileText size={18} /> },
        { key: 'courtRegistration', label: 'Court Registration', icon: <Plus size={18} /> },
      ]
    : [
        { key: 'dashboard', label: 'Dashboard', icon: <Building2 size={18} /> },
        { key: 'courtRegistration', label: 'Court Registration', icon: <Plus size={18} /> },
  ];

  // Filter helpers
  const filteredCourts = courts.filter(c => c.name.toLowerCase().includes(searchCourt.toLowerCase()));
  const filteredRooms = courtRooms.filter(r => r.name.toLowerCase().includes(searchRoom.toLowerCase()));
  const filteredJudges = mockJudges.filter(j => j.name.toLowerCase().includes(searchJudge.toLowerCase()));
  const filteredProsecutors = mockProsecutors.filter(p => p.name.toLowerCase().includes(searchProsecutor.toLowerCase()));

  // Add after other useState hooks
  const handleAppealFormChange = e => setAppealForm({ ...appealForm, [e.target.name]: e.target.value });
  const handleAppealSubmit = e => {
    e.preventDefault();
    if (editingAppeal) {
      setAppeals(appeals.map(a => a.id === editingAppeal.id ? { ...editingAppeal, ...appealForm } : a));
      showToast('Appeal updated!');
    } else {
      setAppeals([
        ...appeals,
        { ...appealForm, id: Date.now() }
      ]);
      showToast('Appeal added!');
    }
    setShowAppealModal(false);
    setEditingAppeal(null);
    setAppealForm({ appealNumber: '', originalCaseId: '', appellant: '', respondent: '', dateFiled: '', status: '' });
  };
  const handleEditAppeal = appeal => {
    setEditingAppeal(appeal);
    setAppealForm({ ...appeal });
    setShowAppealModal(true);
  };
  const handleViewAppeal = appeal => {
    setEditingAppeal(appeal);
    setAppealForm({ ...appeal });
    setShowAppealModal(true); // For now, reuse the modal for view/edit
  };

  // Case handlers
  const handleCaseView = (c) => { setViewingCase(c); setShowCaseViewModal(true); };
  const handleCaseEdit = (c) => { setEditingCase(c); setCaseForm({ ...c }); setShowCaseModal(true); };
  const handleCaseDelete = (c) => setCases(cases.filter(x => x.id !== c.id));
  const handleCaseAdd = () => { setEditingCase(null); setCaseForm({ number: '', title: '', parties: '', type: '', status: '' }); setShowCaseModal(true); };
  const handleCaseFormChange = (e) => setCaseForm({ ...caseForm, [e.target.name]: e.target.value });
  const handleCaseSubmit = (e) => {
    e.preventDefault();
    if (editingCase) {
      setCases(cases.map(c => c.id === editingCase.id ? { ...editingCase, ...caseForm } : c));
      showToast('Case updated!');
    } else {
      setCases([...cases, { ...caseForm, id: Date.now() }]);
      showToast('Case added!');
    }
    setShowCaseModal(false);
    setEditingCase(null);
    setCaseForm({ number: '', title: '', parties: '', type: '', status: '' });
  };

  // Profile handlers
  const handleProfileSave = () => {
    setIsEditingProfile(false);
    showToast('Profile updated!');
  };
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  // Logout handler
  const handleLogout = () => {
    setCourts([]);
    setSelectedCourt(null);
    setActiveTab('dashboard');
    window.location.href = '/login';
  };

  // Helper to get CourtRegistrar info from localStorage (from signup)
  const getCourtRegistrarInfo = () => {
    return { name: '', email: '', phone: '', cnic: '', dob: '' };
  };
  const [courtRegistrarInfo] = useState(getCourtRegistrarInfo());

  if (courts.length === 0) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #e0e7ef 60%, #c9e7fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', position: 'relative' }}>
        {/* Decorative background image */}
        <img src={lawImage} alt="background" style={{ position: 'absolute', top: 0, right: 0, width: 320, opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />
        <Card className="shadow-sm" style={{ maxWidth: 480, width: '100%', borderRadius: 16, padding: '2.5rem 0', zIndex: 1, background: 'rgba(255,255,255,0.98)' }}>
          <Card.Body>
            {/* Registrar Info Section */}
            <div className="mb-4 text-center">
              <div className="mb-2">
                <span className="fw-bold" style={{ fontSize: 22, color: '#22304a' }}>Welcome, {courtRegistrarInfo.name || 'CourtRegistrar'}!</span>
              </div>
              <div className="text-muted mb-1">Please register your court to continue.</div>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-2" style={{ fontSize: 15 }}>
                <span><b>Email:</b> {courtRegistrarInfo.email || 'N/A'}</span>
                <span><b>Phone:</b> {courtRegistrarInfo.phone || 'N/A'}</span>
                <span><b>CNIC:</b> {courtRegistrarInfo.cnic || 'N/A'}</span>
                <span><b>DOB:</b> {courtRegistrarInfo.dob || 'N/A'}</span>
              </div>
            </div>
            <h2 className="fw-bold mb-3 text-center">Register Your Court</h2>
            <Form onSubmit={handleCourtSubmit}>
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Court Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={courtForm.name}
                      onChange={handleCourtFormChange}
                      required
                      autoFocus
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Court ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="courtId"
                      value={courtForm.courtId}
                      onChange={handleCourtFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={courtForm.location}
                      onChange={handleCourtFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="type"
                      value={courtForm.type}
                      onChange={handleCourtFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading} style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 8 }}>
                {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                Register Court
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f4f6fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom" style={{ minHeight: 64, flex: '0 0 auto' }}>
        <div style={{ fontWeight: 600, fontSize: 22 }}>Court Central</div>
        <div className="d-flex align-items-center gap-4">
          <Bell size={24} style={{ color: '#25304a' }} />
          <User size={28} style={{ color: '#25304a' }} />
        </div>
      </div>
      {/* Main Content Flex Row */}
      <div style={{ flex: '1 1 0', display: 'flex', width: '100%', height: '100%', minHeight: 0 }}>
          {/* Sidebar */}
        <div style={{ width: 250, background: '#25304a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0, flex: '0 0 250px' }}>
          <div>
            <div className="d-flex align-items-center gap-2 px-4 py-4" style={{ fontWeight: 700, fontSize: 22 }}>
              <i className="bi bi-bank2" style={{ fontSize: 28, color: '#1ec6b6' }}></i>
              <span style={{ color: '#1ec6b6' }}>Court Central</span>
            </div>
            <Nav className="flex-column gap-1 px-2">
              <Nav.Link className={`d-flex align-items-center gap-2 sidebar-link${selectedPage === 'dashboard' ? ' active' : ''}`} onClick={() => setSelectedPage('dashboard')}><i className="bi bi-grid-1x2"></i> Dashboard</Nav.Link>
              <Nav.Link className={`d-flex align-items-center gap-2 sidebar-link${selectedPage === 'courtRooms' ? ' active' : ''}`} onClick={() => setSelectedPage('courtRooms')}><i className="bi bi-buildings"></i> Court Rooms</Nav.Link>
              <Nav.Link className={`d-flex align-items-center gap-2 sidebar-link${selectedPage === 'cases' ? ' active' : ''}`} onClick={() => setSelectedPage('cases')}><i className="bi bi-file-earmark-text"></i> Cases</Nav.Link>
              <Nav.Link className={`d-flex align-items-center gap-2 sidebar-link${selectedPage === 'appeals' ? ' active' : ''}`} onClick={() => setSelectedPage('appeals')}><i className="bi bi-balance-scale"></i> Appeals</Nav.Link>
            </Nav>
          </div>
          <div className="mb-4 px-2">
            <Nav className="flex-column gap-1">
              <Nav.Link className="d-flex align-items-center gap-2 sidebar-link" onClick={() => setShowProfileModal(true)}><i className="bi bi-person"></i> Profile</Nav.Link>
              <Nav.Link className="d-flex align-items-center gap-2 sidebar-link" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</Nav.Link>
            </Nav>
          </div>
        </div>
        {/* Main Area */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="p-4" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {selectedPage === 'dashboard' && (
              <>
                <div className="mb-4">
                  <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                    <Card.Body>
                      <h1 className="fw-bold mb-1" style={{ color: '#22304a' }}>Welcome, Registrar!</h1>
                      <div className="text-muted" style={{ fontSize: 18 }}>Your central hub for court management tasks.</div>
                    </Card.Body>
                  </Card>
                </div>
                <Row className="g-4">
                  <Col md={8}>
                    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
                      <Card.Body>
                        <h3 className="fw-bold mb-3" style={{ color: '#22304a' }}><i className="bi bi-bank2 me-2"></i>Assigned Court Details</h3>
                        <div className="mb-3">
                          <img src={mockCourt.image} alt="court" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 180 }} />
                        </div>
                        <h4 className="fw-bold mb-2">{mockCourt.name}</h4>
                        <Row className="mb-2">
                          <Col md={6}><i className="bi bi-geo-alt me-1"></i> <b>Location:</b> {mockCourt.location}</Col>
                          <Col md={6}><i className="bi bi-building me-1"></i> <b>Court ID:</b> {mockCourt.courtId}</Col>
                        </Row>
                        <Row className="mb-2">
                          <Col md={6}><i className="bi bi-telephone me-1"></i> <b>Phone:</b> {mockCourt.phone}</Col>
                          <Col md={6}><i className="bi bi-envelope me-1"></i> <b>Email:</b> {mockCourt.email}</Col>
                        </Row>
                        <div className="text-muted mt-2" style={{ fontSize: 15 }}>
                          This is your primary assigned courthouse. For details on other assignments, please check your profile or contact administration.
                        </div>
                      </Card.Body>
                    </Card>
                    <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                      <Card.Body>
                        <h3 className="fw-bold mb-3" style={{ color: '#22304a' }}><i className="bi bi-clock-history me-2"></i>Recent Activity</h3>
                        <div className="table-responsive">
                          <table className="table table-borderless align-middle mb-0">
                            <thead style={{ background: '#f4f6fa' }}>
                              <tr style={{ color: '#22304a', fontWeight: 600 }}>
                                <th>Activity</th>
                                <th>Type</th>
                                <th>Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockActivity.map((a, i) => (
                                <tr key={i}>
                                  <td>{a.activity}</td>
                                  <td>{a.type}</td>
                                  <td>{a.timestamp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
              </Card.Body>
            </Card>
          </Col>
                  <Col md={4}>
                    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
                      <Card.Body>
                        <h3 className="fw-bold mb-3" style={{ color: '#22304a' }}><i className="bi bi-bar-chart me-2"></i>Quick Actions</h3>
                        <div className="mb-3 text-muted">Access key functionalities quickly.</div>
                        <div className="d-grid gap-2">
                          <Button variant="light" className="d-flex align-items-center gap-2 justify-content-start text-start border" style={{ fontWeight: 500 }}>
                            <i className="bi bi-buildings me-2" style={{ color: '#1ec6b6', fontSize: 20 }}></i> Manage Court Rooms
                            <div className="ms-auto small text-muted">View and update court room details.</div>
                        </Button>
                          <Button variant="light" className="d-flex align-items-center gap-2 justify-content-start text-start border" style={{ fontWeight: 500 }}>
                            <i className="bi bi-file-earmark-text me-2" style={{ color: '#1ec6b6', fontSize: 20 }}></i> Manage Cases
                            <div className="ms-auto small text-muted">Access and manage case information.</div>
                                  </Button>
                          <Button variant="light" className="d-flex align-items-center gap-2 justify-content-start text-start border" style={{ fontWeight: 500 }}>
                            <i className="bi bi-person me-2" style={{ color: '#1ec6b6', fontSize: 20 }}></i> View Appeals
                            <div className="ms-auto small text-muted">Monitor and process appeals.</div>
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                      </Row>
              </>
            )}
            {selectedPage === 'courtRooms' && (
              <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="fw-bold mb-1" style={{ color: '#22304a' }}><i className="bi bi-buildings me-2"></i>Court Room Management</h2>
                      <div className="text-muted mb-2">View, add, or edit court rooms for the assigned courthouse.</div>
                            </div>
                    <Button variant="primary" className="d-flex align-items-center gap-2 px-4 py-2" style={{ fontWeight: 500, fontSize: '1.1rem', borderRadius: 8 }} onClick={handleRoomAdd}>
                      <i className="bi bi-plus-lg"></i> Add New Room
                            </Button>
                          </div>
                  <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    <Form.Control placeholder="Search rooms by number, name, or type..." />
                  </InputGroup>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: '#f4f6fa' }}>
                        <tr style={{ color: '#22304a', fontWeight: 600 }}>
                          <th>Room Number</th>
                          <th>Name</th>
                          <th><i className="bi bi-people"></i> Capacity</th>
                          <th><i className="bi bi-building"></i> Type</th>
                          <th><i className="bi bi-calendar-check"></i> Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courtRooms.map((room, i) => (
                          <tr key={i}>
                            <td>{room.number}</td>
                            <td>{room.name}</td>
                            <td>{room.capacity}</td>
                            <td>{room.type}</td>
                            <td>
                              {room.status === 'Available' && <span className="badge bg-primary">Available</span>}
                              {room.status === 'Occupied' && <span className="badge bg-danger">Occupied</span>}
                              {room.status === 'Maintenance' && <span className="badge bg-secondary">Maintenance</span>}
                              {room.status === 'Reserved' && <span className="badge bg-info text-dark">Reserved</span>}
                            </td>
                            <td>
                              <Button variant="outline-secondary" size="sm" className="me-2 p-1 lh-1" onClick={() => handleRoomView(room)}><Eye size={16} /></Button>
                              <Button variant="outline-secondary" size="sm" className="me-2 p-1 lh-1" onClick={() => handleRoomEdit(room)}><Edit2 size={16} /></Button>
                              <Button variant="outline-danger" size="sm" className="p-1 lh-1" onClick={() => handleRoomDelete(room)}><Trash2 size={16} /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                            </div>
                  <div className="text-muted mt-3">A list of court rooms.</div>
                </Card.Body>
              </Card>
            )}
            {selectedPage === 'cases' && (
              <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="fw-bold mb-1" style={{ color: '#22304a' }}><i className="bi bi-gavel me-2"></i>Case Access Management</h2>
                      <div className="text-muted mb-2">View, add, or manage cases within the court system.</div>
                          </div>
                    <Button variant="primary" className="d-flex align-items-center gap-2 px-4 py-2" style={{ fontWeight: 500, fontSize: '1.1rem', borderRadius: 8 }} onClick={handleCaseAdd}>
                      <i className="bi bi-plus-lg"></i> Add New Case
                    </Button>
                          </div>
                  <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    <Form.Control placeholder="Search cases by number, title, or parties..." />
                            </InputGroup>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: '#f4f6fa' }}>
                        <tr style={{ color: '#22304a', fontWeight: 600 }}>
                          <th>Case Number</th>
                          <th>Title</th>
                          <th><i className="bi bi-people"></i> Parties</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((c, i) => (
                          <tr key={i}>
                            <td>{c.number}</td>
                            <td>{c.title}</td>
                            <td>{c.parties}</td>
                            <td>{c.type}</td>
                            <td>
                              {c.status === 'Open' && <span className="badge bg-primary">Open</span>}
                              {c.status === 'Pending' && <span className="badge bg-warning text-dark">Pending</span>}
                              {c.status === 'Closed' && <span className="badge bg-secondary">Closed</span>}
                              {c.status === 'Appealed' && <span className="badge bg-danger">Appealed</span>}
                            </td>
                            <td>
                              <Button variant="outline-secondary" size="sm" className="me-2 p-1 lh-1" onClick={() => handleCaseView(c)}><Eye size={16} /></Button>
                              <Button variant="outline-secondary" size="sm" className="me-2 p-1 lh-1" onClick={() => handleCaseEdit(c)}><Edit2 size={16} /></Button>
                              <Button variant="outline-danger" size="sm" className="p-1 lh-1" onClick={() => handleCaseDelete(c)}><Trash2 size={16} /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                          </div>
                  <div className="text-muted mt-3">A list of registered cases.</div>
                </Card.Body>
              </Card>
            )}
            {selectedPage === 'appeals' && (
              <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="fw-bold mb-1" style={{ color: '#22304a' }}><i className="bi bi-balance-scale me-2"></i>Appeals Monitoring</h2>
                      <div className="text-muted mb-2">View and monitor appeals heard by the court.</div>
                    </div>
                    <Button variant="primary" className="d-flex align-items-center gap-2 px-4 py-2" style={{ fontWeight: 500, fontSize: '1.1rem', borderRadius: 8 }} onClick={() => { setEditingAppeal(null); setAppealForm({ appealNumber: '', originalCaseId: '', appellant: '', respondent: '', dateFiled: '', status: '' }); setShowAppealModal(true); }}>
                      <i className="bi bi-plus-lg"></i> Add New Appeal
                    </Button>
                  </div>
                  <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    <Form.Control placeholder="Search appeals by number, case ID, or parties..." value={searchAppeal} onChange={e => setSearchAppeal(e.target.value)} />
                  </InputGroup>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ background: '#f4f6fa' }}>
                        <tr style={{ color: '#22304a', fontWeight: 600 }}>
                          <th>Appeal Number</th>
                          <th>Original Case ID</th>
                          <th>Appellant</th>
                          <th>Respondent</th>
                          <th><i className="bi bi-calendar"></i> Date Filed</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppeals.map((appeal, i) => (
                          <tr key={appeal.id}>
                            <td>{appeal.appealNumber}</td>
                            <td>{appeal.originalCaseId}</td>
                            <td>{appeal.appellant}</td>
                            <td>{appeal.respondent}</td>
                            <td>{appeal.dateFiled}</td>
                            <td>
                              {appeal.status === 'Under Review' && <span className="badge bg-dark">Under Review</span>}
                              {appeal.status === 'Hearing Scheduled' && <span className="badge bg-light text-dark border">Hearing Scheduled</span>}
                              {appeal.status === 'Decided' && <span className="badge bg-secondary">Decided</span>}
                            </td>
                            <td>
                              <Button variant="light" size="sm" className="me-2 border" onClick={() => handleViewAppeal(appeal)}><i className="bi bi-eye"></i></Button>
                              <Button variant="light" size="sm" className="border" onClick={() => handleEditAppeal(appeal)}><i className="bi bi-pencil"></i></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-muted mt-3">A list of appeals filed with the court.</div>
                </Card.Body>
              </Card>
            )}
                            </div>
                          </div>
                        </div>

      {/* Toasts */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        bg={toast.variant}
        delay={2500}
        autohide
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
      >
        <Toast.Body className="text-white">{toast.message}</Toast.Body>
      </Toast>

      {/* Register/Edit Court Modal */}
      <Modal show={showCourtModal} onHide={() => { setShowCourtModal(false); setEditingCourt(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCourt ? 'Edit Court' : 'Register New Court'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCourtSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Court Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={courtForm.name}
                onChange={handleCourtFormChange}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Court ID</Form.Label>
              <Form.Control
                type="text"
                name="courtId"
                value={courtForm.courtId}
                onChange={handleCourtFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={courtForm.location}
                onChange={handleCourtFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control
                type="text"
                name="type"
                value={courtForm.type}
                onChange={handleCourtFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowCourtModal(false); setEditingCourt(null); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              {editingCourt ? 'Save Changes' : 'Register Court'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add/Edit Room Modal (full form) */}
      <Modal show={showRoomModal} onHide={() => { setShowRoomModal(false); setEditingRoom(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Edit Court Room' : 'Add Court Room'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRoomSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Room Number</Form.Label>
              <Form.Control type="text" name="number" value={roomForm.number} onChange={handleRoomFormChange} required autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={roomForm.name} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" name="capacity" value={roomForm.capacity} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control type="text" name="type" value={roomForm.type} onChange={handleRoomFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={roomForm.status} onChange={handleRoomFormChange} required>
                <option value="">Select status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowRoomModal(false); setEditingRoom(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}{editingRoom ? 'Save Changes' : 'Add Room'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add/Edit Appeal Modal */}
      <Modal show={showAppealModal} onHide={() => { setShowAppealModal(false); setEditingAppeal(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingAppeal ? 'Edit Appeal' : 'Add New Appeal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAppealSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Appeal Number</Form.Label>
              <Form.Control type="text" name="appealNumber" value={appealForm.appealNumber} onChange={handleAppealFormChange} required autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Original Case ID</Form.Label>
              <Form.Control type="text" name="originalCaseId" value={appealForm.originalCaseId} onChange={handleAppealFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Appellant</Form.Label>
              <Form.Control type="text" name="appellant" value={appealForm.appellant} onChange={handleAppealFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Respondent</Form.Label>
              <Form.Control type="text" name="respondent" value={appealForm.respondent} onChange={handleAppealFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date Filed</Form.Label>
              <Form.Control type="date" name="dateFiled" value={appealForm.dateFiled} onChange={handleAppealFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={appealForm.status} onChange={handleAppealFormChange} required>
                <option value="">Select status</option>
                <option value="Under Review">Under Review</option>
                <option value="Hearing Scheduled">Hearing Scheduled</option>
                <option value="Decided">Decided</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowAppealModal(false); setEditingAppeal(null); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              {editingAppeal ? 'Save Changes' : 'Add Appeal'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal show={confirm.show} onHide={() => setConfirm({ show: false, type: '', payload: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirm.type === 'deleteCourt' && (
            <span>Are you sure you want to delete the court <b>{confirm.payload?.name}</b>?</span>
          )}
          {confirm.type === 'deleteRoom' && (
            <span>Are you sure you want to delete the room <b>{confirm.payload?.name}</b>?</span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirm({ show: false, type: '', payload: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            if (confirm.type === 'deleteCourt') confirmDeleteCourt();
            if (confirm.type === 'deleteRoom') confirmDeleteRoom();
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Room View Modal */}
      <Modal show={showRoomViewModal} onHide={() => setShowRoomViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Room Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {viewingRoom && <div><b>Name/Number:</b> {viewingRoom.name}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoomViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Case Add/Edit Modal */}
      <Modal show={showCaseModal} onHide={() => { setShowCaseModal(false); setEditingCase(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCase ? 'Edit Case' : 'Add New Case'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCaseSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Case Number</Form.Label>
              <Form.Control type="text" name="number" value={caseForm.number} onChange={handleCaseFormChange} required autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={caseForm.title} onChange={handleCaseFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Parties</Form.Label>
              <Form.Control type="text" name="parties" value={caseForm.parties} onChange={handleCaseFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control type="text" name="type" value={caseForm.type} onChange={handleCaseFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control type="text" name="status" value={caseForm.status} onChange={handleCaseFormChange} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowCaseModal(false); setEditingCase(null); }}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}{editingCase ? 'Save Changes' : 'Add Case'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Case View Modal */}
      <Modal show={showCaseViewModal} onHide={() => setShowCaseViewModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Case Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {viewingCase && <div><b>Case Number:</b> {viewingCase.number}<br /><b>Title:</b> {viewingCase.title}<br /><b>Parties:</b> {viewingCase.parties}<br /><b>Type:</b> {viewingCase.type}<br /><b>Status:</b> {viewingCase.status}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCaseViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-4">
            {/* Profile Header - Left Panel */}
            <Col xs={12} md={4}>
              <Card className="shadow-sm h-100">
                <Card.Body className="text-center p-4">
                  <div className="position-relative d-inline-block mb-3">
                    <img
                      src={profileImage || `https://picsum.photos/seed/${profileData.name || 'registrar'}/150/150`}
                      alt="Registrar Avatar"
                      className="rounded-circle border border-4 border-primary shadow-sm"
                      width={150}
                      height={150}
                      style={{ objectFit: 'cover' }}
                    />
                    {isEditingProfile && (
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute bottom-0 end-0 rounded-circle border shadow-sm"
                        style={{ width: '32px', height: '32px', lineHeight: '1', padding: '0.3rem' }}
                        onClick={triggerProfileImageUpload}
                        title="Upload new picture"
                      >
                        <Upload size={16} />
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfileImageUpload}
                      accept="image/*"
                      className="d-none"
                    />
                  </div>
                  <h4 className="mb-1 fw-semibold text-primary">{profileData.name}</h4>
                  <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-3">
                    <Button variant="outline-primary" size="sm" href={`mailto:${profileData.email}`}>
                      <Mail size={16} className="me-1" /> Email
                    </Button>
                    <Button variant="outline-primary" size="sm" href={`tel:${profileData.phone}`}>
                      <Phone size={16} className="me-1" /> Call
                    </Button>
                  </div>
                  <hr />
                  <div className="text-start">
                    <p className="mb-2 d-flex align-items-start">
                      <MapPin size={18} className="me-2 text-primary flex-shrink-0 mt-1" />
                      <span>{profileData.court || 'N/A'}</span>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            {/* Profile Details - Right Panel */}
            <Col xs={12} md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-primary">Registrar Information</h5>
                    <div>
                      {isEditingProfile ? (
                        <>
                          <Button variant="success" size="sm" onClick={handleProfileSave} className="me-2">
                            <Save size={16} className="me-1" /> Save
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => setIsEditingProfile(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline-primary" size="sm" onClick={() => setIsEditingProfile(true)}>
                          <Edit3 size={16} className="me-1" /> Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileData.name}
                            disabled={!isEditingProfile}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            disabled={!isEditingProfile}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            disabled={!isEditingProfile}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Court</Form.Label>
                          <Form.Control
                            type="text"
                            name="court"
                            value={profileData.court}
                            disabled={!isEditingProfile}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RegistrarDashboard; 