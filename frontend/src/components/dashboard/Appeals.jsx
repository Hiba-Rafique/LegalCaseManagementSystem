import React, { useState, useMemo } from 'react';
import { Card, Table, InputGroup, Form, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { Search, PlusCircle } from 'lucide-react';

const initialAppeals = [
  { date: '05/10/2025', caseName: 'Innovate LLC Patent Dispute', type: 'Civil', status: 'Open', court: 'Appellate Court', result: 'N/A', resultDate: '' },
  { date: '05/02/2025', caseName: 'Smith v. Jones Construction', type: 'Criminal', status: 'Pending', court: 'Supreme Court', result: 'N/A', resultDate: '' },
  { date: '04/28/2025', caseName: 'Acme Corp v. Beta Innovations', type: 'Civil', status: 'Closed', court: 'Appellate Court', result: 'Granted', resultDate: '' },
  { date: '04/20/2025', caseName: 'Chen Family Trust Admin', type: 'Probate', status: 'Closed', court: 'Probate Appeals', result: 'Denied', resultDate: '' },
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
  const [formData, setFormData] = useState({
    caseName: '',
    type: '',
    court: '',
    description: ''
  });

  const filteredAppeals = useMemo(() => {
    return appeals.filter(a => {
      const matchesSearch =
        a.caseName.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || a.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, appeals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppeal = {
      date: new Date().toLocaleDateString(),
      caseName: formData.caseName,
      type: formData.type,
      status: 'Open',
      court: formData.court,
      result: 'N/A',
      resultDate: ''
    };
    setAppeals([newAppeal, ...appeals]);
    setShowModal(false);
    setFormData({ caseName: '', type: '', court: '', description: '' });
  };

  return (
    <Row className="justify-content-center align-items-start py-4 px-2 px-md-4">
      <Col xs={12} md={11} lg={10} xl={9}>
        <Card>
          <Card.Header className="bg-white border-bottom-0 pb-0">
            <div className="d-flex align-items-center gap-3 mb-2">
              <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="appeals">⚖️</span>Appeals</h4>
              <Button 
                variant="primary" 
                size="sm" 
                className="d-flex align-items-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle size={16} /> File New Appeal
              </Button>
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
                    <th>Result Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppeals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">No appeals found.</td>
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
                        <td>{a.resultDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* File New Appeal Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>File New Appeal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Case Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.caseName}
                onChange={e => setFormData({ ...formData, caseName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="">Select type</option>
                <option value="Civil">Civil</option>
                <option value="Criminal">Criminal</option>
                <option value="Probate">Probate</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Court</Form.Label>
              <Form.Select
                value={formData.court}
                onChange={e => setFormData({ ...formData, court: e.target.value })}
                required
              >
                <option value="">Select court</option>
                <option value="Appellate Court">Appellate Court</option>
                <option value="Supreme Court">Supreme Court</option>
                <option value="Probate Appeals">Probate Appeals</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">File Appeal</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Row>
  );
};

export default Appeals; 