import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';

const Witnesses = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', cnic: '', phone: '',
    email: '', address: '', pasthistory: '',
    caseName: '', statement: '', statementDate: ''
  });
  const [witnesses, setWitnesses] = useState([]);
  const [error, setError] = useState('');

  // 🔹 Fetch data from Flask API using fetch
  useEffect(() => {
    fetch('/api/witnesses', {
      method: 'GET',
      credentials: 'include', // important if using cookies / sessions
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(async response => {
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch');
      }
      return response.json();
    })
    .then(data => {
  const formatted = data.map(item => ({
    id: item.witness.id,
    firstName: item.witness.firstname,
    lastName: item.witness.lastname,
    cnic: item.witness.cnic,
    phone: item.witness.phone,
    email: item.witness.email,
    address: item.witness.address,
    pasthistory: item.witness.pasthistory || '',
    caseName: item.case_id ? `Case #${item.case_id}` : 'N/A',
    statement: item.statement || '',
    statementDate: item.statementdate || ''
  }));
  setWitnesses(formatted);
})

    .catch(err => {
      console.error('Error fetching witnesses:', err);
      setError(err.message);
    });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setWitnesses([{ ...form, id: Date.now() }, ...witnesses]);
    setShow(false);
  };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Witnesses
          <Button variant="primary" onClick={() => setShow(true)}>Add Witness</Button>
        </Card.Header>
        <Card.Body>
          {error && <div className="text-danger mb-2">{error}</div>}
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
            {/* Form fields same as before */}
            {/* ... */}
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
