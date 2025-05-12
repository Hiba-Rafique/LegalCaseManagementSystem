import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';

const mockWitnesses = [
  { id: 1, firstName: 'Ali', lastName: 'Khan', cnic: '12345-6789012-3', phone: '03001234567', email: 'ali.khan@email.com', address: '123 Main St', pasthistory: 'No previous witness', caseName: 'Mock Case 1', statement: 'Saw the accident', statementDate: '2024-06-10' },
  { id: 2, firstName: 'Sara', lastName: 'Ahmed', cnic: '98765-4321098-7', phone: '03111234567', email: 'sara.ahmed@email.com', address: '456 Park Ave', pasthistory: 'Witness for 2 cases', caseName: 'Mock Case 2', statement: 'Heard the argument', statementDate: '2024-06-12' },
];

const Witnesses = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', cnic: '', phone: '', email: '', address: '', pasthistory: '', caseName: '', statement: '', statementDate: '' });
  const [witnesses, setWitnesses] = useState(mockWitnesses);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); setWitnesses([{ ...form, id: Date.now() }, ...witnesses]); setShow(false); };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Witnesses
          <Button variant="primary" onClick={() => setShow(true)}>Add Witness</Button>
        </Card.Header>
        <Card.Body>
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>CNIC</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Past History</th>
                <th>Case Name</th>
                <th>Statement</th>
                <th>Statement Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {witnesses.map(w => (
                <tr key={w.id}>
                  <td>{w.firstName}</td>
                  <td>{w.lastName}</td>
                  <td>{w.cnic}</td>
                  <td>{w.phone}</td>
                  <td>{w.email}</td>
                  <td>{w.address}</td>
                  <td>{w.pasthistory}</td>
                  <td>{w.caseName}</td>
                  <td>{w.statement}</td>
                  <td>{w.statementDate}</td>
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
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>Add Witness</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control name="firstName" value={form.firstName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control name="lastName" value={form.lastName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>CNIC</Form.Label>
              <Form.Control name="cnic" value={form.cnic} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control name="address" value={form.address} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Past History</Form.Label>
              <Form.Control name="pasthistory" value={form.pasthistory} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Case Name</Form.Label>
              <Form.Control name="caseName" value={form.caseName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statement</Form.Label>
              <Form.Control name="statement" value={form.statement} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statement Date</Form.Label>
              <Form.Control type="date" name="statementDate" value={form.statementDate} onChange={handleChange} required />
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

export default Witnesses; 