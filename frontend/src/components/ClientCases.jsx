import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, ListGroup, Button, Modal } from 'react-bootstrap';

function ClientCases() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [historyCase, setHistoryCase] = useState(null);
  const [decisionCase, setDecisionCase] = useState(null);

  useEffect(() => {
    // Simulate an API call
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cases'); // Replace with your actual API endpoint
        const data = await response.json();

        if (data && data.cases && data.cases.length > 0) {
          setCases(data.cases); // Set cases from the API response
        } else {
          setCases([]); // If no cases, set an empty array
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError(err); // Optionally handle error
        setCases([]); // Set an empty array if API call fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleViewHistory = (caseItem) => {
    setHistoryCase(caseItem);
    setShowHistoryModal(true);
  };

  const handleViewDecision = (caseItem) => {
    setDecisionCase(caseItem);
    setShowDecisionModal(true);
  };

  return (
    <div className="container-fluid p-0">
      <Row className="g-4 h-100">
        <Col md={selectedCase ? 8 : 12} className="d-flex flex-column">
          <Card className="shadow-sm rounded-4 w-100 flex-grow-1 mb-0">
            <Card.Body className="p-4">
              <h4 className="mb-4">My Cases</h4>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">Error loading cases: {error.message}</div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Case Title</th>
                        <th>Lawyer Name</th>
                        <th>Court Name</th>
                        <th>Filing Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Next Hearing</th>
                        <th>History</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.length === 0 ? (
                        <tr><td colSpan={8} className="text-center text-muted py-4">No cases found for this user.</td></tr>
                      ) : (
                        cases.map(caseItem => (
                          <tr
                            key={caseItem.id}
                            className={selectedCase?.id === caseItem.id ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleRowClick(caseItem)}
                          >
                            <td>{caseItem.title}</td>
                            <td>{caseItem.lawyers}</td>
                            <td>{caseItem.courtName}</td>
                            <td>{caseItem.filingDate}</td>
                            <td>{caseItem.caseType}</td>
                            <td>
                              <span className={`badge bg-${caseItem.status === 'Closed' ? 'success' : caseItem.status === 'In Progress' ? 'primary' : 'warning'}`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td>{caseItem.nextHearing}</td>
                            <td>
                              <Button 
                                variant="link" 
                                size="sm" 
                                onClick={e => { e.stopPropagation(); handleViewHistory(caseItem); }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        {selectedCase && (
          <Col md={4} className="d-flex flex-column">
            <Card className="shadow-sm rounded-4 w-100 flex-grow-1 mb-0">
              <Card.Body className="p-4">
                <h5 className="mb-3">Evidence</h5>
                {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                  <ListGroup className="mb-4">
                    {selectedCase.evidence.map(ev => (
                      <ListGroup.Item key={ev.id} className="mb-2 border rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div><strong>Type:</strong> {ev.type}</div>
                            <div><strong>Description:</strong> {ev.description}</div>
                            <div><strong>Submitted:</strong> {ev.submittedDate}</div>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            href={ev.evidencePath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-muted mb-4">No evidence for this case.</div>
                )}
                <h5 className="mb-3">Witnesses</h5>
                {selectedCase.witnesses && selectedCase.witnesses.length > 0 ? (
                  <ListGroup>
                    {selectedCase.witnesses.map(w => (
                      <ListGroup.Item key={w.id} className="mb-2 border rounded">
                        <div><strong>Name:</strong> {w.firstName} {w.lastName}</div>
                        <div><strong>CNIC:</strong> {w.cnic}</div>
                        <div><strong>Phone:</strong> {w.phone}</div>
                        <div><strong>Email:</strong> {w.email}</div>
                        <div><strong>Address:</strong> {w.address}</div>
                        <div><strong>Past History:</strong> {w.pastHistory}</div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-muted">No witnesses for this case.</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Final Decision Modal */}
      <Modal show={showDecisionModal} onHide={() => setShowDecisionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Final Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {decisionCase && (
            <div className="p-3">
              <div className="mb-3">
                <h6 className="text-muted mb-2">Decision Date</h6>
                <p className="mb-0">{decisionCase.finalDecision?.date || '-'}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-2">Summary</h6>
                <p className="mb-0">{decisionCase.finalDecision?.summary || '-'}</p>
              </div>
              <div>
                <h6 className="text-muted mb-2">Verdict</h6>
                <p className="mb-0">{decisionCase.finalDecision?.verdict || '-'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDecisionModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Case History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Case History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyCase && (
            <div className="p-3">
              <div className="timeline">
                {historyCase.history.map((h, idx) => (
                  <div key={idx} className="timeline-item mb-3">
                    <div className="timeline-date text-muted mb-1">{h.date}</div>
                    <div className="timeline-content p-2 bg-light rounded">
                      {h.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ClientCases;
