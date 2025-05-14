import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, InputGroup, Form, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { Search, PlusCircle } from 'lucide-react';

const statusVariants = {
  'Open': 'primary',
  'Pending': 'warning',
  'Closed': 'secondary',
};

const Appeals = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState(null);  // Track error state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    caseName: '',
    type: '',
    court: '',
    description: ''
  });

  useEffect(() => {
    // Fetch appeals data from the API
    const fetchAppeals = async () => {
      try {
        const response = await fetch('/api/appeals');
        if (!response.ok) {
          throw new Error('Failed to fetch appeals');
        }
        const data = await response.json();
        setAppeals(data.appeals);  // Update state with fetched data
      } catch (error) {
        setError(error.message);  // Set error state if request fails
      } finally {
        setLoading(false);  // Set loading to false after data is fetched
      }
    };

    fetchAppeals();
  }, []);

  const filteredAppeals = useMemo(() => {
    return appeals.filter(a => {
      const matchesSearch =
        a.casename.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || a.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, appeals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          casename: formData.caseName,
          casetype: formData.type,
          court: formData.court,
          description: formData.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create appeal');
      }

      const data = await response.json();

      // If successful, update the state
      setAppeals([data.appeal, ...appeals]);
      setShowModal(false);
      setFormData({ caseName: '', type: '', court: '', description: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;  // Show loading state while data is being fetched
  }

  if (error) {
    return <div>Error: {error}</div>;  // Show error message if there's an issue with the fetch
  }

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
                        <td>{a.casename}</td>
                        <td>{a.type}</td>
                        <td>
                          <Badge bg={statusVariants[a.status] || 'secondary'} className="px-3 py-1 fs-6">
                            {a.status}
                          </Badge>
                        </td>
                        <td>{a.courtname}</td>  {/* Displaying the court name */}
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
