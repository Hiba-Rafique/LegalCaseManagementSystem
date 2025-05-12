import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Card, Row, Col, InputGroup, Form, Button, Badge, Table, Modal, ListGroup } from 'react-bootstrap';
import { User, PlusCircle, Search, Calendar, FileText, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import HearingSchedule from '../components/HearingSchedule';
import MyCases from '../components/MyCases';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/dashboard.css';

const PROFILE_IMAGE_KEY = 'judgeProfileImage';

function JudgeDashboard() {
  const [activeSection, setActiveSection] = useState('assigned');
  const [profileImage, setProfileImage] = useState(null);
  const [judgeData, setJudgeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackWarning, setFallbackWarning] = useState("");
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const [cases, setCases] = useState([
    {
      id: 1,
      title: 'State v. Smith',
      description: 'Criminal case involving theft',
      caseType: 'Criminal',
      filingDate: '2024-01-15',
      status: 'Open',
      lawyers: 'Alex Mason (Prosecutor) & John Doe (Defense)',
      clientName: 'Jane Smith',
      courtName: 'Metropolis Central Courthouse',
      nextHearing: '2024-03-20',
      remarks: 'Pending evidence submission',
      finalDecision: null,
      history: [
        { date: '2024-01-15', event: 'Case filed' },
        { date: '2024-02-01', event: 'First hearing' }
      ],
      evidence: [
        { 
          id: 1, 
          type: 'Video',
          description: 'Security camera footage from the crime scene',
          submittedDate: '2024-02-01',
          evidencePath: '/evidence/video1.mp4'
        },
        { 
          id: 2, 
          type: 'Document',
          description: 'Witness statement detailing the incident',
          submittedDate: '2024-02-05',
          evidencePath: '/evidence/statement1.pdf'
        }
      ],
      witnesses: [
        { 
          id: 1, 
          firstName: 'John',
          lastName: 'Smith',
          cnic: '12345-6789012-3',
          phone: '555-0123',
          email: 'john.smith@email.com',
          address: '123 Main St, City',
          pastHistory: 'No prior criminal record'
        },
        { 
          id: 2, 
          firstName: 'Sarah',
          lastName: 'Johnson',
          cnic: '98765-4321098-7',
          phone: '555-0124',
          email: 'sarah.j@email.com',
          address: '456 Oak Ave, City',
          pastHistory: 'Expert witness in 3 previous cases'
        }
      ]
    },
    {
      id: 2,
      title: 'People v. Doe',
      description: 'Civil case regarding property dispute',
      caseType: 'Civil',
      filingDate: '2024-02-01',
      status: 'Pending',
      lawyers: 'Sam Fisher (Prosecutor) & Sarah Wilson (Defense)',
      clientName: 'John Doe',
      courtName: 'Metropolis Central Courthouse',
      nextHearing: '2024-03-25',
      remarks: 'Awaiting witness testimony',
      finalDecision: null,
      history: [
        { date: '2024-02-01', event: 'Case filed' }
      ],
      evidence: [
        { 
          id: 1, 
          type: 'Document',
          description: 'Property deed showing ownership history',
          submittedDate: '2024-02-10',
          evidencePath: '/evidence/deed1.pdf'
        }
      ],
      witnesses: [
        { 
          id: 1, 
          firstName: 'Michael',
          lastName: 'Brown',
          cnic: '45678-9012345-6',
          phone: '555-0125',
          email: 'michael.b@email.com',
          address: '789 Pine Rd, City',
          pastHistory: 'Licensed property surveyor with 15 years experience'
        }
      ]
    },
    {
      id: 3,
      title: 'State v. Johnson',
      description: 'Criminal case involving fraud',
      caseType: 'Criminal',
      filingDate: '2023-12-01',
      status: 'Completed',
      lawyers: 'Robert Chen (Prosecutor) & Emily Parker (Defense)',
      clientName: 'David Johnson',
      courtName: 'Metropolis Central Courthouse',
      nextHearing: 'N/A',
      remarks: 'Case closed with final decision',
      finalDecision: {
        verdict: 'Guilty',
        summary: 'Based on the evidence presented and witness testimonies, the defendant is found guilty of fraud. The evidence clearly shows a pattern of intentional deception for financial gain.',
        date: '2024-02-15'
      },
      history: [
        { date: '2023-12-01', event: 'Case filed' },
        { date: '2023-12-15', event: 'First hearing' },
        { date: '2024-01-10', event: 'Evidence submission completed' },
        { date: '2024-01-25', event: 'Final arguments presented' },
        { date: '2024-02-15', event: 'Final decision announced: Guilty' }
      ],
      evidence: [
        { 
          id: 1, 
          type: 'Document',
          description: 'Financial records showing fraudulent transactions',
          submittedDate: '2023-12-20',
          evidencePath: '/evidence/financial_records.pdf'
        },
        { 
          id: 2, 
          type: 'Document',
          description: 'Email correspondence proving intent',
          submittedDate: '2024-01-05',
          evidencePath: '/evidence/emails.pdf'
        },
        { 
          id: 3, 
          type: 'Document',
          description: 'Bank statements showing fund transfers',
          submittedDate: '2024-01-08',
          evidencePath: '/evidence/bank_statements.pdf'
        }
      ],
      witnesses: [
        { 
          id: 1, 
          firstName: 'James',
          lastName: 'Wilson',
          cnic: '34567-8901234-5',
          phone: '555-0126',
          email: 'james.w@email.com',
          address: '321 Bank St, City',
          pastHistory: 'Financial expert witness in 5 previous cases'
        },
        { 
          id: 2, 
          firstName: 'Lisa',
          lastName: 'Thompson',
          cnic: '23456-7890123-4',
          phone: '555-0127',
          email: 'lisa.t@email.com',
          address: '654 Finance Ave, City',
          pastHistory: 'Bank manager with 20 years experience'
        }
      ]
    }
  ]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCase, setHistoryCase] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showWitnessesModal, setShowWitnessesModal] = useState(false);
  const [decisionForm, setDecisionForm] = useState({
    verdict: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [showAddHearingModal, setShowAddHearingModal] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    caseTitle: '',
    courtName: '',
    hearingDate: '',
    hearingTime: '',
    remarks: ''
  });
  const [hearings, setHearings] = useState([
    {
      id: 1,
      caseTitle: 'State v. Smith',
      courtName: 'Metropolis Central Courthouse',
      date: '2024-03-20',
      time: '10:00',
      remarks: 'Initial hearing for evidence presentation'
    },
    {
      id: 2,
      caseTitle: 'People v. Doe',
      courtName: 'Metropolis Central Courthouse',
      date: '2024-03-25',
      time: '14:30',
      remarks: ''
    }
  ]);
  const today = new Date().toISOString().split('T')[0];

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = 
      case_.title.toLowerCase().includes(search.toLowerCase()) ||
      case_.caseType.toLowerCase().includes(search.toLowerCase()) ||
      case_.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = status === 'All' || case_.status === status;
    
    return matchesSearch && matchesStatus;
  });

  const [documents] = useState([
    { id: 1, name: 'Case Evidence 1', type: 'PDF', uploaded: '2024-03-01', path: '/docs/evidence1.pdf' },
    { id: 2, name: 'Witness Statement', type: 'DOCX', uploaded: '2024-03-05', path: '/docs/witness1.docx' },
    { id: 3, name: 'Court Order', type: 'PDF', uploaded: '2024-03-10', path: '/docs/order1.pdf' }
  ]);

  const [docSearch, setDocSearch] = useState('');
  const [docFilter, setDocFilter] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(docSearch.toLowerCase());
    const matchesFilter = docFilter === 'all' || doc.type.toLowerCase() === docFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const fetchJudgeData = async () => {
      try {
        const response = await fetch('/api/judge/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch judge data');

        const result = await response.json();

        if (result.success) {
          setJudgeData(result.user);
          const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
          setProfileImage(storedImage || 'https://via.placeholder.com/40');
        } else {
          setError('Failed to load user data.');
        }
      } catch (err) {
        setFallbackWarning("Backend unavailable, showing mock data.");
        setJudgeData({ username: "Mock Judge", specialization: "Criminal Law" });
        setProfileImage('https://via.placeholder.com/40');
      } finally {
        setLoading(false);
      }
    };

    fetchJudgeData();
  }, []);

  const handleProfileClick = () => {
    navigate('/judge-profile');
  };

  const handleViewHistory = (case_) => {
    setHistoryCase(case_);
    setShowHistoryModal(true);
  };

  const handleViewEvidence = (case_) => {
    setSelectedCase(case_);
    setShowEvidenceModal(true);
  };

  const handleViewWitnesses = (case_) => {
    setSelectedCase(case_);
    setShowWitnessesModal(true);
  };

  const handleAnnounceDecision = (case_) => {
    setSelectedCase(case_);
    setDecisionForm({
      verdict: case_.finalDecision || '',
      summary: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowDecisionModal(true);
  };

  const handleDecisionSubmit = (e) => {
    e.preventDefault();
    if (selectedCase) {
      setCases(cases.map(c => 
        c.id === selectedCase.id 
          ? { 
              ...c, 
              finalDecision: decisionForm.verdict,
              status: 'Completed',
              history: [
                ...c.history,
                { 
                  date: decisionForm.date,
                  event: `Decision announced: ${decisionForm.verdict}`
                }
              ]
            }
          : c
      ));
      setShowDecisionModal(false);
    }
  };

  const handleHearingFormChange = (e) => {
    const { name, value } = e.target;
    setHearingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddHearing = (e) => {
    e.preventDefault();
    if (hearingForm.hearingDate < today) {
      alert('Cannot schedule hearings for past dates.');
      return;
    }
    setHearings([
      ...hearings,
      {
        id: Date.now(),
        caseTitle: hearingForm.caseTitle,
        courtName: hearingForm.courtName,
        date: hearingForm.hearingDate,
        time: hearingForm.hearingTime,
        remarks: hearingForm.remarks
      }
    ]);
    setShowAddHearingModal(false);
    setHearingForm({ caseTitle: '', courtName: '', hearingDate: '', hearingTime: '', remarks: '' });
  };

  const handleAddRemarks = (hearingId) => {
    const remarks = prompt('Enter remarks for this hearing:');
    if (remarks !== null) {
      setHearings(hearings.map(h => h.id === hearingId ? { ...h, remarks } : h));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light border-bottom" style={{ background: 'linear-gradient(90deg, #22304a 0%, #1ec6b6 100%) !important' }}>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="/logo.png" alt="LegalEase" height="40" />
          </a>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleProfileClick}
              style={{ borderColor: '#1ec6b6', color: '#1ec6b6' }}
            >
              <User size={20} />
              Profile
            </button>
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
              style={{ borderColor: '#1ec6b6', color: '#1ec6b6' }}
            >
              Logout
            </button>
            <div className="profile-image-container ms-2" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <Image
                src={profileImage || 'https://via.placeholder.com/40'}
                roundedCircle
                width={40}
                height={40}
                className="profile-image"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ minHeight: 'calc(100vh - 72px)' }}>
        {/* Sidebar */}
        <div className="sidebar border-end" style={{ background: 'linear-gradient(90deg, #22304a 0%, #1ec6b6 100%) !important' }}>
          <div className="p-3">
            <h4 className="text-primary mb-4" style={{ color: '#1ec6b6' }}>Judge Panel</h4>
            <div className="nav flex-column">
              <button
                className={`nav-link btn text-start mb-2 ${activeSection === 'assigned' ? 'active' : ''}`}
                onClick={() => setActiveSection('assigned')}
                style={{ color: activeSection === 'assigned' ? '#1ec6b6' : '#333' }}
              >
                <span className="me-2"></span> Assigned Cases
              </button>
            <button
                className={`nav-link btn text-start mb-2 ${activeSection === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveSection('schedule')}
                style={{ color: activeSection === 'schedule' ? '#1ec6b6' : '#333' }}
              >
                <span className="me-2"></span> Hearing Schedule
              </button>
              <button
                className={`nav-link btn text-start mb-2 ${activeSection === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveSection('documents')}
                style={{ color: activeSection === 'documents' ? '#1ec6b6' : '#333' }}
              >
                <span className="me-2"></span> Documents
            </button>
            </div>
          </div>
      </div>

      {/* Main Content */}
        <div className="flex-grow-1 p-4 bg-light d-flex flex-column" style={{ minHeight: 0 }}>
        {activeSection === 'assigned' && (
            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom-0 pb-0">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="cases">📋</span>Assigned Cases</h4>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <Row className="g-2 mb-3">
                  <Col md={8}>
                    <InputGroup>
                      <InputGroup.Text><Search size={16} /></InputGroup.Text>
                      <Form.Control
                        placeholder="Search cases..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Case Title</th>
                      <th>Court</th>
                      <th>Lawyers</th>
                      <th>Filing Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                    {filteredCases.map(case_ => (
                      <tr key={case_.id}>
                        <td>
                          <div className="fw-bold">{case_.title}</div>
                          <small className="text-muted">{case_.description}</small>
                        </td>
                        <td>{case_.courtName}</td>
                        <td>{case_.lawyers}</td>
                        <td>{case_.filingDate}</td>
                        <td>
                          <Badge bg={case_.status === 'Open' ? 'success' : 'warning'}>
                            {case_.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewHistory(case_)}
                            >
                              History
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewEvidence(case_)}
                            >
                              Evidence
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleViewWitnesses(case_)}
                            >
                              Witnesses
                            </Button>
                            {case_.status !== 'Completed' && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleAnnounceDecision(case_)}
                              >
                                Decision
                              </Button>
                            )}
                          </div>
                        </td>
                  </tr>
                ))}
              </tbody>
                </Table>
              </Card.Body>
            </Card>
        )}

        {activeSection === 'schedule' && (
            <div className="hearing-schedule-section d-flex flex-column flex-md-row w-100" style={{ minHeight: '70vh' }}>
              <div className="flex-grow-1 p-3" style={{ minWidth: 0 }}>
                <Card className="h-100 w-100">
                  <Card.Header className="bg-white border-bottom-0 pb-0 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="schedule">📅</span>Hearing Schedule</h4>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="d-flex align-items-center gap-2"
                      onClick={() => setShowAddHearingModal(true)}
                    >
                      <PlusCircle size={16} /> Add Next Hearing
                    </Button>
                  </Card.Header>
                  <Card.Body className="pt-0">
                    <Table responsive hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Case Title</th>
                          <th>Court Name</th>
                          <th>Hearing Date</th>
                          <th>Hearing Time</th>
                          <th>Remarks</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hearings.length === 0 ? (
                          <tr><td colSpan={6} className="text-center text-muted py-4">No hearings scheduled.</td></tr>
                        ) : (
                          hearings.map(hearing => (
                            <tr key={hearing.id}>
                              <td>{hearing.caseTitle}</td>
                              <td>{hearing.courtName}</td>
                              <td>{hearing.date}</td>
                              <td>{hearing.time}</td>
                              <td>{hearing.remarks || <span className="text-muted">-</span>}</td>
                              <td>
                                <Button 
                                  variant="outline-warning" 
                                  size="sm" 
                                  onClick={() => handleAddRemarks(hearing.id)}
                                >
                                  {hearing.remarks ? 'Edit Remarks' : 'Add Remarks'}
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </div>
              <div className="today-hearings-panel p-3" style={{ minWidth: 320, maxWidth: 400 }}>
                <Card className="h-100 w-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Today's Hearings</h5>
                  </Card.Header>
                  <Card.Body>
                    {hearings.filter(h => h.date === today).length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <Calendar size={48} className="mb-3 opacity-50" />
                        <p className="mb-0">No hearings scheduled for today</p>
                      </div>
                    ) : (
                      hearings.filter(h => h.date === today).map(hearing => (
                        <div key={hearing.id} className="mb-3 p-3 border rounded">
                          <h6 className="mb-2">{hearing.caseTitle}</h6>
                          <div className="small text-muted mb-2">
                            <div>Court: {hearing.courtName}</div>
                            <div>Time: {hearing.time}</div>
                          </div>
                          {hearing.remarks ? (
                            <div className="mt-2">
                              <strong>Remarks:</strong> {hearing.remarks}
                            </div>
                          ) : (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleAddRemarks(hearing.id)}
                            >
                              Add Remarks
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </div>

              {/* Add Hearing Modal */}
              <Modal show={showAddHearingModal} onHide={() => setShowAddHearingModal(false)} centered className="event-modal">
                <Modal.Header closeButton className="border-0">
                  <Modal.Title>Schedule New Hearing</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddHearing}>
                  <Modal.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Case Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="caseTitle"
                        value={hearingForm.caseTitle}
                        onChange={handleHearingFormChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Court Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="courtName"
                        value={hearingForm.courtName}
                        onChange={handleHearingFormChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Hearing Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="hearingDate"
                        value={hearingForm.hearingDate}
                        onChange={handleHearingFormChange}
                        min={today}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Hearing Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="hearingTime"
                        value={hearingForm.hearingTime}
                        onChange={handleHearingFormChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Remarks (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="remarks"
                        value={hearingForm.remarks}
                        onChange={handleHearingFormChange}
                        rows={3}
                        placeholder="Add any additional notes or instructions..."
                      />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowAddHearingModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Schedule Hearing
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
            </div>
          )}

          {activeSection === 'documents' && (
            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom-0 pb-0">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="documents">📄</span>Documents</h4>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <InputGroup style={{ maxWidth: 350 }}>
                    <InputGroup.Text><Search size={16} /></InputGroup.Text>
                    <Form.Control
                      placeholder="Search documents..."
                      value={docSearch}
                      onChange={e => setDocSearch(e.target.value)}
                    />
                  </InputGroup>
                  <InputGroup style={{ maxWidth: 180 }}>
                    <InputGroup.Text><Filter size={16} /></InputGroup.Text>
                    <Form.Select
                      value={docFilter}
                      onChange={e => setDocFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                    </Form.Select>
                  </InputGroup>
                </div>
                <div className="flex-grow-1 overflow-auto w-100" style={{ minHeight: 0 }}>
                  {filteredDocuments.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredDocuments.map(doc => (
                        <ListGroup.Item
                          key={doc.id}
                          className="d-flex align-items-center justify-content-between px-3 py-2 bg-white border-bottom rounded-3 mb-2 shadow-sm"
                          style={{ transition: 'background-color 0.2s ease-in-out', cursor: 'default' }}
                        >
                          <div className="d-flex align-items-center gap-2 overflow-hidden me-2" style={{ minWidth: 0 }}>
                            <FileText className="text-secondary flex-shrink-0" size={20} />
                            <span className="text-truncate fw-medium" style={{ color: '#333' }}>{doc.name}</span>
                          </div>
                          <div className="d-flex align-items-center gap-3 flex-shrink-0">
                            <span className="text-muted d-none d-md-inline-block">{doc.type}</span>
                            <span className="text-muted d-none d-md-inline-block">{doc.uploaded}</span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => window.open(doc.path, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <p className="text-muted fs-5">No documents available.</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* History Modal */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)}
        centered
        className="event-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Case History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup variant="flush">
            {selectedCase?.history.map((event, index) => (
              <ListGroup.Item key={index} className="border-0 mb-3 p-3 rounded-3 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg={event.type === 'Hearing' ? 'primary' : 'info'}>
                    {event.type}
                  </Badge>
                  <span className="fw-bold">{event.date}</span>
                </div>
                <p className="mb-0">{event.event}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Witnesses Modal */}
      <Modal 
        show={showWitnessesModal} 
        onHide={() => setShowWitnessesModal(false)}
        centered
        className="event-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Case Witnesses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup variant="flush">
            {selectedCase?.witnesses.map((witness, index) => (
              <ListGroup.Item key={index} className="border-0 mb-3 p-3 rounded-3 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg="info">Witness</Badge>
                  <span className="fw-bold">{witness.firstName} {witness.lastName}</span>
                </div>
                <div className="mb-2">
                  <strong>CNIC:</strong> {witness.cnic}<br />
                  <strong>Phone:</strong> {witness.phone}<br />
                  <strong>Email:</strong> {witness.email}<br />
                  <strong>Address:</strong> {witness.address}
                </div>
                <div>
                  <strong>Past History:</strong>
                  <p className="mb-0">{witness.pastHistory}</p>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowWitnessesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Evidence Modal */}
      <Modal 
        show={showEvidenceModal} 
        onHide={() => setShowEvidenceModal(false)}
        centered
        className="event-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Case Evidence</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup variant="flush">
            {selectedCase?.evidence.map((item, index) => (
              <ListGroup.Item key={index} className="border-0 mb-3 p-3 rounded-3 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg="secondary">{item.type}</Badge>
                  <span className="fw-bold">{item.submittedDate}</span>
                </div>
                <p className="mb-2">{item.description}</p>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Path: {item.evidencePath}</small>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => window.open(item.evidencePath, '_blank')}
                  >
                    View Evidence
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowEvidenceModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Decision Modal */}
      <Modal 
        show={showDecisionModal} 
        onHide={() => setShowDecisionModal(false)}
        centered
        className="event-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Announce Final Decision</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDecisionSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Verdict</Form.Label>
              <Form.Select
                name="verdict"
                value={decisionForm.verdict}
                onChange={(e) => setDecisionForm({...decisionForm, verdict: e.target.value})}
                required
              >
                <option value="">Select Verdict</option>
                <option value="Guilty">Guilty</option>
                <option value="Not Guilty">Not Guilty</option>
                <option value="Dismissed">Dismissed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Decision Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={decisionForm.date}
                onChange={(e) => setDecisionForm({...decisionForm, date: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Summary</Form.Label>
              <Form.Control
                as="textarea"
                name="summary"
                value={decisionForm.summary}
                onChange={(e) => setDecisionForm({...decisionForm, summary: e.target.value})}
                rows={4}
                placeholder="Provide a detailed summary of the decision..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowDecisionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Announce Decision
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default JudgeDashboard;

<style>{`
  .judge-dashboard-header-gradient, .dashboard-header-gradient {
    background: linear-gradient(90deg, #22304a 0%, #1ec6b6 100%) !important;
  }
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
