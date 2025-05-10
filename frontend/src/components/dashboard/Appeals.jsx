import React, { useState, useMemo } from 'react';
import { Card, Table, Button, InputGroup, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { Search, PlusCircle } from 'lucide-react';

const initialAppeals = [
  { date: '05/10/2025', caseName: 'Innovate LLC Patent Dispute', type: 'Civil', status: 'Open', court: 'Appellate Court', result: 'N/A' },
  { date: '05/02/2025', caseName: 'Smith v. Jones Construction', type: 'Criminal', status: 'Pending', court: 'Supreme Court', result: 'N/A' },
  { date: '04/28/2025', caseName: 'Acme Corp v. Beta Innovations', type: 'Civil', status: 'Closed', court: 'Appellate Court', result: 'Granted' },
  { date: '04/20/2025', caseName: 'Chen Family Trust Admin', type: 'Probate', status: 'Closed', court: 'Probate Appeals', result: 'Denied' },
];

const statusVariants = {
  'Open': 'primary',
  'Pending': 'warning',
  'Closed': 'secondary',
};

const Appeals = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [appeals, setAppeals] = useState(initialAppeals);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: '',
    caseName: '',
    type: 'Civil',
    status: 'Open',
    court: '',
    result: '',
  });
  const [formError, setFormError] = useState('');

  const filteredAppeals = useMemo(() => {
    return appeals.filter(a => {
      const matchesSearch =
        a.caseName.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || a.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, appeals]);

  const handleShowModal = () => {
    setForm({ date: '', caseName: '', type: 'Civil', status: 'Open', court: '', result: '' });
    setFormError('');
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.caseName || !form.type || !form.status || !form.court) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setAppeals([{ ...form }, ...appeals]);
    setShowModal(false);
  };

  return (
    <Row className="justify-content-center align-items-start py-4 px-2 px-md-4">
      <Col xs={12} md={11} lg={10} xl={9}>
        <Card className="shadow-sm rounded-4">
          <Card.Header className="bg-white border-bottom-0 pb-0">
            <div className="d-flex align-items-center gap-3 mb-2">
              <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="appeals">⚖️</span>Appeals</h4>
              <div className="ms-auto">
                <Button variant="primary" className="d-flex align-items-center gap-2 rounded-pill px-4 py-2" style={{ fontWeight: 500, fontSize: '1.1rem' }} onClick={handleShowModal}>
                  <PlusCircle size={20} /> File New Appeal
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="pt-0">
            <Row className="g-2 mb-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text><Search size={16} /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search by case or type..."
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
                    <th>Date</th>
                    <th>Case Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Court</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppeals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No appeals found.</td>
                    </tr>
                  ) : (
                    filteredAppeals.map((a, idx) => (
                      <tr key={idx}>
                        <td>{a.date}</td>
                        <td>{a.caseName}</td>
                        <td>{a.type}</td>
                        <td>
                          <Badge bg={statusVariants[a.status] || 'secondary'} className="px-3 py-1 fs-6">
                            {a.status}
                          </Badge>
                        </td>
                        <td>{a.court}</td>
                        <td>{a.result}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        {/* Modal for New Appeal */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>File New Appeal</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Body>
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={form.date} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Case Name</Form.Label>
                <Form.Control type="text" name="caseName" value={form.caseName} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={form.type} onChange={handleFormChange} required>
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Probate">Probate</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={form.status} onChange={handleFormChange} required>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Court</Form.Label>
                <Form.Control type="text" name="court" value={form.court} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Result</Form.Label>
                <Form.Control type="text" name="result" value={form.result} onChange={handleFormChange} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">Add Appeal</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default Appeals; 