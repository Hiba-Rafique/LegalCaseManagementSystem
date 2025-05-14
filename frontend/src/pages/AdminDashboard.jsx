import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Card, Image, Spinner, Alert } from 'react-bootstrap';
import { LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/40');
  const [adminData, setAdminData] = useState({ username: 'Muhammad Kaif' });
  
  // State to hold logs fetched from the API
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logs from the API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const result = await res.json();
        
        if (res.ok) {
          setLogs(result);  // Assuming the response is an array of log objects
        } else {
          setError('Failed to load logs');
        }
      } catch (err) {
        setError('An error occurred while fetching logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    Object.values(log).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Gradient Header */}
      <div className="dashboard-header-gradient p-3" style={{ background: 'linear-gradient(90deg, #22304a 0%, #1ec6b6 100%)', flex: '0 0 auto' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0" style={{ color: '#fff', fontWeight: 700 }}>Admin Dashboard</h4>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>|</span>
            <div className="d-flex align-items-center gap-2">
              <Image
                src={profileImage}
                roundedCircle
                width={40}
                height={40}
                className="border"
                style={{ borderColor: '#fff' }}
              />
              <div>
                <h6 className="mb-0" style={{ color: '#fff', fontWeight: 600 }}>{adminData?.username}</h6>
                <small style={{ color: 'rgba(255,255,255,0.85)' }}>Admin</small>
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline-danger d-flex align-items-center gap-2 logout-btn"
            onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: '#fff', fontWeight: 600 }}
          >
            <LogOut size={20} color="#fff" />
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <Container fluid className="py-4">
        <Card className="mb-4">
          <Card.Body>
            <h4 className="mb-3" style={{ color: '#22304a', fontWeight: 700 }}>System Logs</h4>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            
            {/* Show loading spinner if the logs are being fetched */}
            {loading && (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" />
              </div>
            )}

            {/* Show error if fetching fails */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Show the logs table once data is fetched */}
            {!loading && !error && (
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
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.logid}>
                          <td>{log.actiontype}</td>
                          <td>{log.description}</td>
                          <td>
                            <span className={`badge ${log.status === 'Success' ? 'bg-success' : 'bg-danger'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td>{new Date(log.actiontimestamp).toLocaleString()}</td>
                          <td>{log.entitytype}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No logs found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminDashboard;
