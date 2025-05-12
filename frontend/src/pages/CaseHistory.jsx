import React, { useState } from 'react';
import { Card, Table, Button } from 'react-bootstrap';

const mockHistory = [
  { id: 1, date: '2024-05-01', event: 'Filing', remarks: 'Case filed in court.' },
  { id: 2, date: '2024-05-10', event: 'Hearing', remarks: 'First hearing scheduled.' },
  { id: 3, date: '2024-05-15', event: 'Adjournment', remarks: 'Hearing adjourned.' },
];

const CaseHistory = () => {
  const [fallbackWarning, setFallbackWarning] = useState("");
  let historyData = mockHistory;

  return (
    <div className="container py-4">
      {fallbackWarning && (
        <div className="alert alert-warning text-center">{fallbackWarning}</div>
      )}
      <Card className="shadow mb-4">
        <Card.Header as="h5">Case History</Card.Header>
        <Card.Body>
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map(h => (
                <tr key={h.id}>
                  <td>{h.date}</td>
                  <td>{h.event}</td>
                  <td>{h.remarks}</td>
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
    </div>
  );
};

export default CaseHistory; 