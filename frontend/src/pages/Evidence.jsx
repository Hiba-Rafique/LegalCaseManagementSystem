import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';

const mockEvidence = [
  { id: 1, evidenceType: 'Document', description: 'Contract copy', submissionDate: '2024-06-10', caseName: 'Mock Case 1' },
  { id: 2, evidenceType: 'Photo', description: 'Accident scene', submissionDate: '2024-06-12', caseName: 'Mock Case 2' },
];

const Evidence = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ evidenceType: '', description: '', submissionDate: '', caseName: '' });
  const [evidence, setEvidence] = useState(mockEvidence);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); setEvidence([{ ...form, id: Date.now() }, ...evidence]); setShow(false); };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Evidence
          <Button variant="primary" onClick={() => setShow(true)}>Add Evidence</Button>
        </Card.Header>
        <Card.Body>
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Evidence Type</th>
                <th>Description</th>
                <th>Submission Date</th>
                <th>Case Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map(e => (
                <tr key={e.id}>
                  <td>{e.evidenceType}</td>
                  <td>{e.description}</td>
                  <td>{e.submissionDate}</td>
                  <td>{e.caseName}</td>
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
        <Modal.Header closeButton><Modal.Title>Add Evidence</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Evidence Type</Form.Label>
              <Form.Control name="evidenceType" value={form.evidenceType} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Submission Date</Form.Label>
              <Form.Control type="date" name="submissionDate" value={form.submissionDate} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Case Name</Form.Label>
              <Form.Control name="caseName" value={form.caseName} onChange={handleChange} required />
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

export default Evidence; 