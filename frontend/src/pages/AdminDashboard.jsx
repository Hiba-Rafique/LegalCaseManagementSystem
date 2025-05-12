import React, { useState } from 'react';
import { Container, Table, Form, Card } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for system logs
  const mockLogs = [
    {
      id: 1,
      actionType: 'Login',
      description: 'User logged in successfully',
      status: 'Success',
      timestamp: '2024-03-20 10:30:00',
      entityType: 'User'
    },
    {
      id: 2,
      actionType: 'Case Creation',
      description: 'New case created',
      status: 'Success',
      timestamp: '2024-03-20 11:15:00',
      entityType: 'Case'
    },
    {
      id: 3,
      actionType: 'Document Upload',
      description: 'Failed to upload document',
      status: 'Failed',
      timestamp: '2024-03-20 12:00:00',
      entityType: 'Document'
    }
  ];

  const filteredLogs = mockLogs.filter(log =>
    Object.values(log).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <DashboardLayout>
      <Container fluid className="py-4">
        <h2 className="mb-4">Admin Dashboard</h2>
        
        <Card className="mb-4">
          <Card.Body>
            <h4 className="mb-3">System Logs</h4>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Action Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Entity Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.actionType}</td>
                      <td>{log.description}</td>
                      <td>
                        <span className={`badge ${log.status === 'Success' ? 'bg-success' : 'bg-danger'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.timestamp}</td>
                      <td>{log.entityType}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard; 