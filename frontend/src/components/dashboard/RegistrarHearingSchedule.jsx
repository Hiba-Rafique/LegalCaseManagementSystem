import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const RegistrarHearingSchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);
  const [hearings, setHearings] = useState([]);

  useEffect(() => {
    // Fetch hearings from the backend when the component loads
    const fetchHearings = async () => {
      try {
        const response = await fetch('/api/hearings');
        const data = await response.json();
        setHearings(data.hearings);
      } catch (error) {
        console.error('Error fetching hearings:', error);
      }
    };
    fetchHearings();
  }, []);

  const [hearingForm, setHearingForm] = useState({
    caseName: '',
    date: '',
    time: '',
    venue: '',
    judge: '',
    status: 'Scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingHearing) {
      setHearings(hearings.map(h => 
        h.id === editingHearing.id ? { ...h, ...hearingForm } : h
      ));
    } else {
      setHearings([...hearings, { ...hearingForm, id: Date.now() }]);
    }
    setShowModal(false);
    setEditingHearing(null);
    setHearingForm({
      caseName: '',
      date: '',
      time: '',
      venue: '',
      judge: '',
      status: 'Scheduled'
    });
  };

  const handleEdit = (hearing) => {
    setEditingHearing(hearing);
    setHearingForm(hearing);
    setShowModal(true);
  };

  const handleDelete = (hearingId) => {
    setHearings(hearings.filter(h => h.id !== hearingId));
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#22304a' }}>
            <i className="bi bi-calendar-event me-2"></i>Hearing Schedule
          </h2>
          <div className="text-muted">Manage and view court hearing schedules.</div>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Case Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Judge</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hearings.map((hearing) => (
                  <tr key={hearing.hearingid}>
                    <td>{hearing.caseName || 'N/A'}</td>
                    <td>{hearing.hearingdate || 'N/A'}</td>
                    <td>{hearing.hearingtime || 'N/A'}</td>
                    <td>{hearing.courtroomid || 'N/A'}</td>
                    <td>{hearing.judge || 'N/A'}</td>
                    <td>
                      <Badge bg={
                        hearing.status === 'Scheduled' ? 'success' :
                        hearing.status === 'Pending' ? 'warning' :
                        'secondary'
                      }>
                        {hearing.status || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(hearing)}
                      >
                        {hearing.courtroomid ? 'Edit Venue' : 'Add Venue'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHearing && editingHearing.courtroomid ? 'Edit Venue' : 'Add Venue'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Case Name</Form.Label>
              <Form.Control
                type="text"
                value={hearingForm.caseName}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={hearingForm.date}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={hearingForm.time}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Control
                type="text"
                value={hearingForm.venue}
                onChange={(e) => setHearingForm({ ...hearingForm, venue: e.target.value })}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Judge</Form.Label>
              <Form.Control
                type="text"
                value={hearingForm.judge}
                readOnly
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={hearingForm.status}
                readOnly
                disabled
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingHearing && editingHearing.courtroomid ? 'Update Venue' : 'Add Venue'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrarHearingSchedule;
