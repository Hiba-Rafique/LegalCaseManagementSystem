import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';

const Bail = () => {
  const [bailData, setBailData] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    bailstatus: '',
    bailamount: '',
    baildate: '',
    remarks: '',
    bailcondition: '',
    caseName: ''
  });
  const [fallbackWarning, setFallbackWarning] = useState("");

  useEffect(() => {
    const fetchBails = async () => {
      try {
        const response = await fetch('/api/bails', {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch bails');

        const data = await response.json();

        setBailData(
          data.bails.map(b => ({
            id: b.bailid,
            caseid: b.caseid,
            bailstatus: b.bailstatus,
            bailamount: b.bailamount,
            baildate: b.baildate,
            remarks: b.remarks,
            bailcondition: b.bailcondition,
            caseName: `Case #${b.caseid}`
          }))
        );
      } catch (err) {
        console.error(err);
        setFallbackWarning("Failed to load live bail data. Showing mock data.");
        setBailData([
          {
            id: 1,
            bailstatus: 'Pending',
            bailamount: 5000,
            baildate: '2024-06-01',
            remarks: 'Awaiting approval',
            bailcondition: 'Passport submission',
            caseName: 'Mock Case 1'
          },
          {
            id: 2,
            bailstatus: 'Approved',
            bailamount: 10000,
            baildate: '2024-06-05',
            remarks: 'Approved by judge',
            bailcondition: 'Weekly check-in',
            caseName: 'Mock Case 2'
          }
        ]);
      }
    };

    fetchBails();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setShow(false);
    // TODO: Implement submit to backend
  };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Bail Requests
          <Button variant="primary" onClick={() => setShow(true)}>Request Bail</Button>
        </Card.Header>
        <Card.Body>
          {fallbackWarning && (
            <div className="alert alert-warning text-center">{fallbackWarning}</div>
          )}
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Case Name</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bailData.map(b => (
                <tr key={b.id}>
                  <td>{b.caseName}</td>
                  <td>{b.bailstatus}</td>
                  <td>${b.bailamount}</td>
                  <td>{b.baildate}</td>
                  <td>{b.remarks}</td>
                  <td>{b.bailcondition}</td>
                  <td>
                    <Button size="sm" variant="primary" className="me-1">Edit</Button>
                    <Button size="sm" variant="info" className="me-1">View</Button>
                    <Button size="sm" variant="secondary">Download</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Request Bail Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Bail</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Case Name</Form.Label>
              <Form.Control name="caseName" value={form.caseName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control name="bailstatus" value={form.bailstatus} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" name="bailamount" value={form.bailamount} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="baildate" value={form.baildate} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control name="remarks" value={form.remarks} disabled readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Condition</Form.Label>
              <Form.Control name="bailcondition" value={form.bailcondition} disabled readOnly />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Bail;
