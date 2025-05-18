import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Card, Row, Col, InputGroup, Form, Button, Badge, Table, Modal, ListGroup } from 'react-bootstrap';
import { User, PlusCircle, Search, Calendar, FileText, Filter } from 'lucide-react';
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
  const [cases, setCases] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCase, setHistoryCase] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Evidence Modal
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Witnesses Modal
  const [showWitnessesModal, setShowWitnessesModal] = useState(false);
  const [witnesses, setWitnesses] = useState([]);
  const [loadingWitnesses, setLoadingWitnesses] = useState(false);

  // Documents Modal
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [decisionForm, setDecisionForm] = useState({
    verdict: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Hearing state (unchanged)
  const [showAddHearingModal, setShowAddHearingModal] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    caseTitle: '',
    courtName: '',
    hearingDate: '',
    hearingTime: '',
    remarks: ''
  });
  const [hearings, setHearings] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  // Document search/filter (unchanged)
  const [docSearch, setDocSearch] = useState('');
  const [docFilter, setDocFilter] = useState('all');
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.name || '').toLowerCase().includes(docSearch.toLowerCase());
    const matchesFilter = docFilter === 'all' || (doc.type || '').toLowerCase() === docFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Fetch judge profile
  useEffect(() => {
    const fetchJudgeData = async () => {
      try {
        const response = await fetch('/api/judgeprofile', {
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

  // Fetch cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch cases');

        const result = await response.json();
        if (result.cases) {
          setCases(result.cases.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            caseType: c.caseType,
            filingDate: c.filingDate,
            status: c.status,
            lawyers: c.lawyers,
            clientName: c.clientName || '',
            courtName: c.courtName,
            nextHearing: c.nextHearing || 'N/A',
            remarks: c.remarks || '',
            finalDecision: c.finalDecision,
            history: c.history,
          })));
        }
      } catch (err) {
        setError('Error fetching cases.');
      }
    };

    fetchCases();
  }, []);

  // Fetch hearings
  useEffect(() => {
    const fetchHearings = async () => {
      try {
        const response = await fetch('/api/hearings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch hearings');
        }

        const result = await response.json();
        if (result.hearings) {
          setHearings(result.hearings.map(h => ({
            id: h.id,
            casetitle: h.casetitle || 'N/A',
            courtname: h.courtname || 'N/A',
            hearingdate: h.hearingdate,
            hearingtime: h.hearingtime,
            remarks: h.remarks || ''
          })));
        }
      } catch (err) {
        // silent
      }
    };

    fetchHearings();
  }, []);

  // Filtering for assigned cases
  const filteredCases = cases.filter(case_ => {
    const matchesSearch =
      (case_.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (case_.caseType || '').toLowerCase().includes(search.toLowerCase()) ||
      (case_.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === 'All' || case_.status === status;

    return matchesSearch && matchesStatus;
  });

  // --- MODAL HANDLERS ---

  // History: always fetch latest from backend
  const handleViewHistory = async (case_) => {
    try {
      const response = await fetch(`/api/cases/${case_.id}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      setHistoryCase({ ...case_, history: data.history || [] });
    } catch {
      setHistoryCase({ ...case_, history: [] });
    }
    setShowHistoryModal(true);
  };

  // Evidence: fetch from backend
  const handleViewEvidence = async (case_) => {
    setSelectedCase(case_);
    setShowEvidenceModal(true);
    setLoadingEvidence(true);
    try {
      const response = await fetch(`/api/cases/${case_.id}/evidence`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      setEvidence(
        (data.evidence || []).map(ev => ({
          id: ev.evidence_id || ev.id,
          type: ev.evidencetype || ev.type,
          description: ev.description,
          submittedDate: ev.submitteddate || ev.submittedDate,
          evidencePath: ev.filepath || ev.evidencePath || ev.path
        }))
      );
    } catch (err) {
      setEvidence([]);
    } finally {
      setLoadingEvidence(false);
    }
  };

  // Witnesses: fetch from backend
const handleViewWitnesses = async (case_) => {
  setSelectedCase(case_);
  setShowWitnessesModal(true);
  setLoadingWitnesses(true);
  try {
    const response = await fetch(`/api/cases/${case_.id}/witnesses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    const data = await response.json();
    setWitnesses(
      (data.witnesses || []).map(w => ({
        id: w.witness_id,
        firstName: w.firstname,
        lastName: w.lastname,
        cnic: w.cnic,
        phone: w.phone,
        email: w.email,
        address: w.address,
        pastHistory: w.pasthistory,
        statement: w.statement,
        statementdate: w.statementdate,
      }))
    );
  } catch (err) {
    setWitnesses([]);
  } finally {
    setLoadingWitnesses(false);
  }
};

  // Documents: fetch from backend
  const handleViewDocuments = async (case_) => {
  setSelectedCase(case_);
  setShowDocumentsModal(true);
  setLoadingDocuments(true);
  try {
    const response = await fetch(`/api/cases/${case_.id}/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    const data = await response.json();
    setDocuments(
      (data.documents || []).map(doc => ({
        id: doc.id,
        name: doc.title,
        type: doc.type,
        uploaded: doc.uploadDate || doc.submissiondate,
        path: doc.path,
      }))
    );
  } catch (err) {
    setDocuments([]);
  } finally {
    setLoadingDocuments(false);
  }
};

  // Decision Modal
  const handleAnnounceDecision = (case_) => {
    setSelectedCase(case_);
    setDecisionForm({
      verdict: case_.finalDecision?.verdict || '',
      summary: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowDecisionModal(true);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/final-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          verdict: decisionForm.verdict,
          decisionsummary: decisionForm.summary,
          decisiondate: decisionForm.date,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit final decision');
      }

      setCases(cases.map(c =>
        c.id === selectedCase.id
          ? {
              ...c,
              finalDecision: { verdict: decisionForm.verdict },
              status: 'Completed',
              history: [
                ...(c.history || []),
                {
                  date: decisionForm.date,
                  event: `Decision announced: ${decisionForm.verdict}`
                }
              ]
            }
          : c
      ));

      setShowDecisionModal(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
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
              onClick={() => navigate('/judge-profile')}
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
            <div className="profile-image-container ms-2" onClick={() => navigate('/judge-profile')} style={{ cursor: 'pointer' }}>
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
                          <div className="d-flex gap-2 flex-wrap">
                            <Button variant="outline-primary" size="sm" onClick={() => handleViewHistory(case_)}>History</Button>
                            <Button variant="outline-info" size="sm" onClick={() => handleViewEvidence(case_)}>Evidence</Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => handleViewWitnesses(case_)}>Witnesses</Button>
                            <Button variant="outline-dark" size="sm" onClick={() => handleViewDocuments(case_)}>Documents</Button>
                            {case_.status !== 'Completed' && (
                              <Button variant="outline-success" size="sm" onClick={() => handleAnnounceDecision(case_)}>Decision</Button>
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
  <Card className="mb-4">
    <Card.Header>
      <h4 className="mb-0 fw-bold">Hearing Schedule</h4>
    </Card.Header>
    <Card.Body>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Case Title</th>
            <th>Court</th>
            <th>Date</th>
            <th>Time</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {hearings.map(h => (
            <tr key={h.id}>
              <td>{h.casetitle}</td>
              <td>{h.courtname}</td>
              <td>{h.hearingdate}</td>
              <td>{h.hearingtime}</td>
              <td>{h.remarks}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
)}

{activeSection === 'documents' && (
  <Card className="mb-4">
    <Card.Header>
      <h4 className="mb-0 fw-bold">All Documents</h4>
    </Card.Header>
    <Card.Body>
      <InputGroup className="mb-3">
        <InputGroup.Text><Search size={16} /></InputGroup.Text>
        <Form.Control
          placeholder="Search documents..."
          value={docSearch}
          onChange={e => setDocSearch(e.target.value)}
        />
        <Form.Select
          value={docFilter}
          onChange={e => setDocFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
        </Form.Select>
      </InputGroup>
      <ListGroup variant="flush">
        {filteredDocuments.length > 0 ? filteredDocuments.map((doc, idx) => (
          <ListGroup.Item key={doc.id || idx} className="d-flex align-items-center justify-content-between px-3 py-2 bg-white border-bottom rounded-3 mb-2 shadow-sm">
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
        )) : (
          <div className="text-center text-muted">No documents found.</div>
        )}
      </ListGroup>
    </Card.Body>
  </Card>
)}

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
                {historyCase?.history?.length > 0 ? (
                  historyCase.history.map((event, index) => (
                    <ListGroup.Item key={index} className="border-0 mb-3 p-3 rounded-3 shadow-sm">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg={event.type === 'Hearing' ? 'primary' : 'info'}>
                          {event.type || 'Event'}
                        </Badge>
                        <span className="fw-bold">{event.date}</span>
                      </div>
                      <p className="mb-0">{event.event}</p>
                    </ListGroup.Item>
                  ))
                ) : (
                  <div className="text-center text-muted">No history available for this case.</div>
                )}
              </ListGroup>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowHistoryModal(false)}>
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
              {loadingEvidence ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <ListGroup variant="flush">
                  {evidence.length > 0 ? evidence.map((item, index) => (
                    <ListGroup.Item key={index} className="border-0 mb-3 p-3 rounded-3 shadow-sm">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="secondary">{item.type}</Badge>
                        <span className="fw-bold">{item.submittedDate}</span>
                      </div>
                      <p className="mb-2">{item.description}</p>
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">Path: {item.evidencePath}</small>
                        {item.evidencePath && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => window.open(item.evidencePath, '_blank')}
                          >
                            View Evidence
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  )) : (
                    <div className="text-center text-muted">No evidence found for this case.</div>
                  )}
                </ListGroup>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowEvidenceModal(false)}>
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
              {loadingWitnesses ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <ListGroup variant="flush">
                  {witnesses.length > 0 ? witnesses.map((witness, index) => (
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
                  )) : (
                    <div className="text-center text-muted">No witnesses found for this case.</div>
                  )}
                </ListGroup>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowWitnessesModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Documents Modal */}
          <Modal 
            show={showDocumentsModal} 
            onHide={() => setShowDocumentsModal(false)}
            centered
            className="event-modal"
          >
            <Modal.Header closeButton className="border-0">
              <Modal.Title>Case Documents</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loadingDocuments ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <ListGroup variant="flush">
                  {documents.length > 0 ? documents.map((doc, index) => (
                    <ListGroup.Item
                      key={doc.id || index}
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
                  )) : (
                    <div className="text-center text-muted">No documents found for this case.</div>
                  )}
                </ListGroup>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" onClick={() => setShowDocumentsModal(false)}>
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
      </div>

      <style>{`
        @media (max-width: 991.98px) {
          .sidebar {
            min-width: 100%;
            max-width: 100%;
          }
        }
        @media (max-width: 767.98px) {
          .dashboard-container {
            padding: 0 !important;
          }
          .sidebar {
            min-width: 100%;
            max-width: 100%;
          }
          .table-responsive {
            overflow-x: auto;
          }
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
    </div>
  );
}

export default JudgeDashboard;