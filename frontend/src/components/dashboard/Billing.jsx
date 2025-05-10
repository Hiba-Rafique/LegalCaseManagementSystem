import React, { useState, useMemo } from 'react';
import { Card, Table, Button, InputGroup, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { Search, PlusCircle } from 'lucide-react';

const initialPayments = [
  { date: '05/08/2025', caseName: 'Innovate LLC Patent Dispute', description: 'Monthly Retainer', amount: 2500, status: 'Due', method: 'N/A' },
  { date: '05/07/2025', caseName: 'State of Confusion v. Miller', description: 'Transcript Copy', amount: 75, status: 'Pending', method: 'N/A' },
  { date: '05/04/2025', caseName: 'Smith v. Jones Construction', description: 'Court Filing Fee', amount: 500, status: 'Paid', method: 'Credit Card' },
  { date: '04/29/2025', caseName: 'Acme Corp v. Beta Innovations', description: 'Expert Witness Retainer', amount: 1250.75, status: 'Paid', method: 'Bank Transfer' },
  { date: '04/24/2025', caseName: 'Chen Family Trust Admin', description: 'Consultation Fee', amount: 300, status: 'Paid', method: 'Credit Card' },
];

const statusVariants = {
  'Due': 'danger',
  'Pending': 'warning',
  'Paid': 'success',
};

const Billing = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [payments, setPayments] = useState(initialPayments);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: '',
    caseName: '',
    description: '',
    amount: '',
    status: 'Due',
    method: '',
  });
  const [formError, setFormError] = useState('');

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.caseName.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, payments]);

  const handleShowModal = () => {
    setForm({ date: '', caseName: '', description: '', amount: '', status: 'Due', method: '' });
    setFormError('');
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.caseName || !form.description || !form.amount || !form.status) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setPayments([{ ...form, amount: parseFloat(form.amount) }, ...payments]);
    setShowModal(false);
  };

  return (
    <Row className="justify-content-center align-items-start py-4 px-2 px-md-4">
      <Col xs={12} md={11} lg={10} xl={9}>
        <Card className="shadow-sm rounded-4">
          <Card.Header className="bg-white border-bottom-0 pb-0">
            <div className="d-flex align-items-center gap-3 mb-2">
              <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="billing">📋</span>Billing & Payments</h4>
              <div className="ms-auto">
                <Button variant="primary" className="d-flex align-items-center gap-2 rounded-pill px-4 py-2" style={{ fontWeight: 500, fontSize: '1.1rem' }} onClick={handleShowModal}>
                  <PlusCircle size={20} /> Make New Payment
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
                    placeholder="Search by case or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Due">Due</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Col>
            </Row>
            <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Case Name</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No payments found.</td>
                    </tr>
                  ) : (
                    filteredPayments.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.date}</td>
                        <td>{p.caseName}</td>
                        <td>{p.description}</td>
                        <td>${p.amount.toFixed(2)}</td>
                        <td>
                          <Badge bg={statusVariants[p.status] || 'secondary'} className="px-3 py-1 fs-6">
                            {p.status}
                          </Badge>
                        </td>
                        <td>{p.method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        {/* Modal for New Payment */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Make New Payment</Modal.Title>
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
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={form.description} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" name="amount" value={form.amount} onChange={handleFormChange} required min="0" step="0.01" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={form.status} onChange={handleFormChange} required>
                  <option value="Due">Due</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Control type="text" name="method" value={form.method} onChange={handleFormChange} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">Add Payment</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default Billing; 