import React, { useState, useMemo } from 'react';
import { Card, Table, InputGroup, Form, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { Search } from 'lucide-react';

const Billing = ({ payments = [], onCreatePayment }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    casename: '',
    paymentdate: '',
    mode: '',
  });
  const [courtPaymentData, setCourtPaymentData] = useState(null);

  // Simulate fetching payment info from court table
  const courtPayments = [
  {
    casename: 'State v. Smith',
    purpose: 'Filing',
    balance: 1000,
    status: 'Pending',
    courtname: 'Metropolis Central Courthouse'  // lowercase n
  },
  {
    casename: 'People v. Doe',
    purpose: 'Consultation',
    balance: 2000,
    status: 'Pending',
    courtname: 'Metropolis Central Courthouse'  // lowercase n
  }
];


  const handleCaseChange = (e) => {
    const casename = e.target.value;
    setForm({ ...form, casename });
    const found = courtPayments.find(p => p.casename === casename);
    setCourtPaymentData(found || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courtPaymentData) return;
    onCreatePayment({
      ...courtPaymentData,
      paymentdate: form.paymentdate,
      mode: form.mode
    });
    setShowModal(false);
    setForm({ casename: '', paymentdate: '', mode: '' });
    setCourtPaymentData(null);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.casename?.toLowerCase().includes(search.toLowerCase()) ||
        p.purpose?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, payments]);

  return (
    <Row className="justify-content-center align-items-start py-4 px-2 px-md-4">
      <Col xs={12} md={11} lg={10} xl={9}>
        <Card>
          <Card.Header className="bg-white border-bottom-0 pb-0">
            <div className="d-flex align-items-center gap-3 mb-2">
              <h4 className="mb-0 fw-bold"><span className="me-2" role="img" aria-label="billing">💰</span>Billing & Payments</h4>
              <Button variant="primary" size="sm" className="ms-auto" onClick={() => setShowModal(true)}>
                Add Payment
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="pt-0">
            <Row className="g-2 mb-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text><Search size={16} /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search by case or purpose..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </Col>
            </Row>
            <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Case Name</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Court Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">No payments found.</td>
                    </tr>
                  ) : (
                    filteredPayments.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.paymentdate}</td>
                        <td>{p.casename}</td>
                        <td>{p.purpose}</td>
                        <td>${p.balance}</td>
                        <td>{p.mode}</td>
                        <td>
                          <Badge bg={p.status === 'Paid' ? 'success' : 'warning'} className="px-3 py-1 fs-6">
                            {p.status}
                          </Badge>
                        </td>
                        <td>{p.courtname}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Payment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {courtPaymentData && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Purpose</Form.Label>
                    <Form.Control value={courtPaymentData.purpose} disabled readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control value={courtPaymentData.balance} disabled readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control value={courtPaymentData.status} disabled readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Court Name</Form.Label>
                    <Form.Control value={courtPaymentData.courtName} disabled readOnly />
                  </Form.Group>
                </>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Control type="text" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control type="date" value={form.paymentdate} onChange={e => setForm({ ...form, paymentdate: e.target.value })} required />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={!courtPaymentData}>Add Payment</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default Billing;