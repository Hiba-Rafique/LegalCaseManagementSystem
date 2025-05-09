import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, ListGroup, Nav, Badge, Tab, Toast, Spinner, InputGroup } from 'react-bootstrap';
import { Plus, Building2, Users, Gavel, Briefcase, DollarSign, UserCheck, FileText, Search, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const RegistrarDashboard = () => {
  // Courts state
  const [courts, setCourts] = useState([]);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [courtForm, setCourtForm] = useState({ name: '', location: '' });
  const [editingCourt, setEditingCourt] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [activeTab, setActiveTab] = useState('courts');
  const [searchCourt, setSearchCourt] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Court management state
  const [courtRooms, setCourtRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '' });
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

  // Toast helpers
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: 'success' }), 2500);
  };

  // COURT CRUD
  const handleCourtFormChange = (e) => setCourtForm({ ...courtForm, [e.target.name]: e.target.value });
  const handleCourtSubmit = (e) => {
    e.preventDefault();
    if (!courtForm.name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      if (editingCourt) {
        setCourts(courts.map(c => c.id === editingCourt.id ? { ...editingCourt, ...courtForm } : c));
        showToast('Court updated!');
      } else {
        setCourts([...courts, {
          id: Date.now(),
          name: courtForm.name,
          location: courtForm.location,
          rooms: [], judges: [], prosecutors: [], payments: [], appeals: [], cases: [],
        }]);
        showToast('Court registered!');
      }
      setCourtForm({ name: '', location: '' });
      setShowCourtModal(false);
      setEditingCourt(null);
      setLoading(false);
    }, 700);
  };
  const handleEditCourt = (court) => {
    setEditingCourt(court);
    setCourtForm({ name: court.name, location: court.location });
    setShowCourtModal(true);
  };
  const handleDeleteCourt = (court) => setConfirm({ show: true, type: 'deleteCourt', payload: court });
  const confirmDeleteCourt = () => {
    setCourts(courts.filter(c => c.id !== confirm.payload.id));
    setConfirm({ show: false, type: '', payload: null });
    showToast('Court deleted!', 'danger');
    setSelectedCourt(null);
    setActiveTab('courts');
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
        setCourtRooms([...courtRooms, { id: Date.now(), name: roomForm.name }]);
        showToast('Room added!');
      }
      setRoomForm({ name: '' });
      setShowRoomModal(false);
      setEditingRoom(null);
      setLoading(false);
    }, 500);
  };
  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ name: room.name });
    setShowRoomModal(true);
  };
  const handleDeleteRoom = (room) => setConfirm({ show: true, type: 'deleteRoom', payload: room });
  const confirmDeleteRoom = () => {
    setCourtRooms(courtRooms.filter(r => r.id !== confirm.payload.id));
    setConfirm({ show: false, type: '', payload: null });
    showToast('Room deleted!', 'danger');
  };

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
    setActiveTab('courts');
    showToast('Court updated!');
  };

  // Sidebar navigation
  const navItems = [
    { key: 'courts', label: 'Courts', icon: <Building2 size={18} /> },
    { key: 'courtRooms', label: 'Court Rooms', icon: <Users size={18} /> },
    { key: 'judges', label: 'Judges', icon: <Gavel size={18} /> },
    { key: 'prosecutors', label: 'Prosecutors', icon: <UserCheck size={18} /> },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { key: 'appeals', label: 'Appeals', icon: <FileText size={18} /> },
    { key: 'cases', label: 'Cases', icon: <Briefcase size={18} /> },
  ];

  // Filter helpers
  const filteredCourts = courts.filter(c => c.name.toLowerCase().includes(searchCourt.toLowerCase()));
  const filteredRooms = courtRooms.filter(r => r.name.toLowerCase().includes(searchRoom.toLowerCase()));
  const filteredJudges = mockJudges.filter(j => j.name.toLowerCase().includes(searchJudge.toLowerCase()));
  const filteredProsecutors = mockProsecutors.filter(p => p.name.toLowerCase().includes(searchProsecutor.toLowerCase()));
  const filteredCases = mockCases.filter(c => c.title.toLowerCase().includes(searchCase.toLowerCase()));

  return (
    <div className="bg-light min-vh-100">
      <Container fluid className="py-4">
        <Row>
          {/* Sidebar */}
          <Col xs={12} md={3} lg={2} className="mb-4 mb-md-0">
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-3">
                <h5 className="fw-bold mb-4 text-primary">Registrar Panel</h5>
                <Nav variant="pills" className="flex-column gap-2">
                  {navItems.map(item => (
                    <Nav.Link
                      key={item.key}
                      active={activeTab === item.key}
                      onClick={() => setActiveTab(item.key)}
                      className="d-flex align-items-center gap-2"
                      disabled={item.key !== 'courts' && !selectedCourt}
                    >
                      {item.icon} {item.label}
                    </Nav.Link>
                  ))}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={12} md={9} lg={10}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <Tab.Container activeKey={activeTab}>
                  {/* Courts Tab */}
                  <Tab.Content>
                    <Tab.Pane eventKey="courts">
                      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <h4 className="fw-bold mb-0">Courts</h4>
                        <InputGroup style={{ maxWidth: 300 }}>
                          <InputGroup.Text><Search size={16} /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search courts..."
                            value={searchCourt}
                            onChange={e => setSearchCourt(e.target.value)}
                          />
                        </InputGroup>
                        <Button variant="primary" onClick={() => { setShowCourtModal(true); setEditingCourt(null); }}>
                          <Plus size={16} className="me-2" /> Register Court
                        </Button>
                      </div>
                      <Row className="g-3">
                        {filteredCourts.length === 0 && (
                          <Col>
                            <div className="text-muted text-center py-5">No courts found.</div>
                          </Col>
                        )}
                        {filteredCourts.map(court => (
                          <Col md={6} lg={4} key={court.id}>
                            <Card className="shadow-sm border-0 rounded-3 h-100">
                              <Card.Body className="d-flex flex-column">
                                <h5 className="fw-bold mb-2 text-primary">{court.name}</h5>
                                <div className="mb-2 text-muted">{court.location}</div>
                                <div className="mb-3">
                                  <Badge bg="secondary" className="me-2">{court.rooms.length} Rooms</Badge>
                                  <Badge bg="info" className="me-2">{court.judges.length} Judges</Badge>
                                  <Badge bg="success">{court.cases.length} Cases</Badge>
                                </div>
                                <div className="d-flex gap-2 mt-auto align-self-end">
                                  <Button variant="outline-primary" size="sm" onClick={() => handleSelectCourt(court)}>
                                    Operate Court
                                  </Button>
                                  <Button variant="outline-secondary" size="sm" onClick={() => handleEditCourt(court)}>
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCourt(court)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Tab.Pane>

                    {/* Court Management Tabs */}
                    {selectedCourt && (
                      <>
                        <Tab.Pane eventKey="courtRooms">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Court Rooms - {selectedCourt.name}</h4>
                            </div>
                            <InputGroup style={{ maxWidth: 300 }}>
                              <InputGroup.Text><Search size={16} /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search rooms..."
                                value={searchRoom}
                                onChange={e => setSearchRoom(e.target.value)}
                              />
                            </InputGroup>
                            <Button variant="primary" onClick={() => { setShowRoomModal(true); setEditingRoom(null); }}>
                              <Plus size={16} className="me-2" /> Add Room
                            </Button>
                          </div>
                          <ListGroup>
                            {filteredRooms.length === 0 && <ListGroup.Item>No rooms found.</ListGroup.Item>}
                            {filteredRooms.map(room => (
                              <ListGroup.Item key={room.id} className="d-flex justify-content-between align-items-center">
                                {room.name}
                                <div className="d-flex gap-2">
                                  <Button size="sm" variant="outline-secondary" onClick={() => handleEditRoom(room)}><Edit2 size={14} /></Button>
                                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteRoom(room)}><Trash2 size={14} /></Button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Tab.Pane>
                        <Tab.Pane eventKey="judges">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Judges - {selectedCourt.name}</h4>
                            </div>
                            <InputGroup style={{ maxWidth: 300 }}>
                              <InputGroup.Text><Search size={16} /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search judges..."
                                value={searchJudge}
                                onChange={e => setSearchJudge(e.target.value)}
                              />
                            </InputGroup>
                          </div>
                          <div className="mb-3">Assigned Judges:</div>
                          <ListGroup horizontal className="mb-3">
                            {courtJudges.length === 0 && <ListGroup.Item>No judges assigned.</ListGroup.Item>}
                            {courtJudges.map(judge => (
                              <ListGroup.Item key={judge.id} className="d-flex align-items-center gap-2">
                                {judge.name}
                                <Button size="sm" variant="outline-danger" onClick={() => handleUnassignJudge(judge)}>&times;</Button>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="mb-2">Assign Judge:</div>
                          <div className="d-flex gap-2 flex-wrap">
                            {filteredJudges.map(judge => (
                              <Button key={judge.id} size="sm" variant="outline-primary" onClick={() => handleAssignJudge(judge)}>{judge.name}</Button>
                            ))}
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="prosecutors">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Prosecutors - {selectedCourt.name}</h4>
                            </div>
                            <InputGroup style={{ maxWidth: 300 }}>
                              <InputGroup.Text><Search size={16} /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search prosecutors..."
                                value={searchProsecutor}
                                onChange={e => setSearchProsecutor(e.target.value)}
                              />
                            </InputGroup>
                          </div>
                          <div className="mb-3">Assigned Prosecutors:</div>
                          <ListGroup horizontal className="mb-3">
                            {courtProsecutors.length === 0 && <ListGroup.Item>No prosecutors assigned.</ListGroup.Item>}
                            {courtProsecutors.map(prosecutor => (
                              <ListGroup.Item key={prosecutor.id} className="d-flex align-items-center gap-2">
                                {prosecutor.name}
                                <Button size="sm" variant="outline-danger" onClick={() => handleUnassignProsecutor(prosecutor)}>&times;</Button>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="mb-2">Assign Prosecutor:</div>
                          <div className="d-flex gap-2 flex-wrap">
                            {filteredProsecutors.map(prosecutor => (
                              <Button key={prosecutor.id} size="sm" variant="outline-primary" onClick={() => handleAssignProsecutor(prosecutor)}>{prosecutor.name}</Button>
                            ))}
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="payments">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Payments - {selectedCourt.name}</h4>
                            </div>
                          </div>
                          <Button variant="success" className="mb-3" onClick={handleAddPayment}>Add Payment</Button>
                          <ListGroup>
                            {courtPayments.length === 0 && <ListGroup.Item>No payments yet.</ListGroup.Item>}
                            {courtPayments.map(payment => (
                              <ListGroup.Item key={payment.id} className="d-flex justify-content-between align-items-center">
                                <span>${payment.amount}</span>
                                <span className="text-muted small">{payment.date}</span>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Tab.Pane>
                        <Tab.Pane eventKey="appeals">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Appeals - {selectedCourt.name}</h4>
                            </div>
                          </div>
                          <Button variant="info" className="mb-3" onClick={handleAddAppeal}>Add Appeal</Button>
                          <ListGroup>
                            {courtAppeals.length === 0 && <ListGroup.Item>No appeals yet.</ListGroup.Item>}
                            {courtAppeals.map(appeal => (
                              <ListGroup.Item key={appeal.id}>{appeal.title}</ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Tab.Pane>
                        <Tab.Pane eventKey="cases">
                          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <Button variant="light" className="rounded-circle p-2 me-2" onClick={() => setActiveTab('courts')}><ArrowLeft size={18} /></Button>
                              <h4 className="fw-bold mb-0">Cases - {selectedCourt.name}</h4>
                            </div>
                            <InputGroup style={{ maxWidth: 300 }}>
                              <InputGroup.Text><Search size={16} /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search cases..."
                                value={searchCase}
                                onChange={e => setSearchCase(e.target.value)}
                              />
                            </InputGroup>
                          </div>
                          <div className="mb-2">Granted Cases:</div>
                          <ListGroup horizontal className="mb-3">
                            {courtCases.length === 0 && <ListGroup.Item>No cases granted.</ListGroup.Item>}
                            {courtCases.map(courtCase => (
                              <ListGroup.Item key={courtCase.id} className="d-flex align-items-center gap-2">
                                {courtCase.title}
                                <Button size="sm" variant="outline-danger" onClick={() => handleRevokeCase(courtCase)}>&times;</Button>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="mb-2">Grant Access to Case:</div>
                          <div className="d-flex gap-2 flex-wrap">
                            {filteredCases.map(courtCase => (
                              <Button key={courtCase.id} size="sm" variant="outline-primary" onClick={() => handleGrantCase(courtCase)}>{courtCase.title}</Button>
                            ))}
                          </div>
                        </Tab.Pane>
                        <div className="d-flex justify-content-end mt-4 gap-2">
                          <Button variant="primary" onClick={handleSaveCourt}>Save Changes</Button>
                          <Button variant="outline-secondary" onClick={() => { setSelectedCourt(null); setActiveTab('courts'); }}>Back to Courts</Button>
                        </div>
                      </>
                    )}
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={courtForm.location}
                onChange={handleCourtFormChange}
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

      {/* Add/Edit Room Modal */}
      <Modal show={showRoomModal} onHide={() => { setShowRoomModal(false); setEditingRoom(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Edit Court Room' : 'Add Court Room'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRoomSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Room Name/Number</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={roomForm.name}
                onChange={handleRoomFormChange}
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowRoomModal(false); setEditingRoom(null); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              {editingRoom ? 'Save Changes' : 'Add Room'}
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
    </div>
  );
};

export default RegistrarDashboard; 