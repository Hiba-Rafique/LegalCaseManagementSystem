import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form } from 'react-bootstrap';

const Surety = () => {
  const [suretyData, setSuretyData] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    firstname: '', lastname: '', cnic: '', phone: '', email: '',
    address: '', pasthistory: '', caseName: ''
  });
  const [fallbackWarning, setFallbackWarning] = useState("");

  useEffect(() => {
    const fetchSuretyForLawyer = async () => {
      try {
        const response = await fetch('/api/surety/from-lawyer', {
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch surety');

        const data = await response.json();
        setSuretyData([{
          id: data.suretyid,
          firstname: data.firstname,
          lastname: data.lastname,
          cnic: data.cnic,
          phone: data.phone,
          email: data.email,
          address: data.address,
          pasthistory: data.pasthistory,
          caseName: `Case #${data.caseid}`
        }]);
      } catch (error) {
        console.error(error);
        setFallbackWarning("Failed to load surety. Showing mock data.");
        setSuretyData([
          {
            id: 1,
            firstname: 'Ali',
            lastname: 'Khan',
            cnic: '12345-6789012-3',
            phone: '03001234567',
            email: 'ali.khan@email.com',
            address: '123 Main St',
            pasthistory: 'No previous surety',
            caseName: 'Mock Case 1'
          }
        ]);
      }
    };

    fetchSuretyForLawyer();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setShow(false);
    // TODO: Add POST logic here
  };

  return (
    <div className="container py-4">
      <Card className="shadow mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Sureties
          <Button variant="primary" onClick={() => setShow(true)}>Add Surety</Button>
        </Card.Header>
        <Card.Body>
          {fallbackWarning && (
            <div className="alert alert-warning text-center">{fallbackWarning}</div>
          )}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suretyData.map(s => (
                <tr key={s.id}>
                  <td>{s.firstname}</td>
                  <td>{s.lastname}</td>
                  <td>{s.cnic}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{s.pasthistory}</td>
                  <td>{s.caseName}</td>
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
        <Modal.Header closeButton><Modal.Title>Add Surety</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control name="firstname" value={form.firstname} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control name="lastname" value={form.lastname} onChange={handleChange} required />
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

export default Surety;
