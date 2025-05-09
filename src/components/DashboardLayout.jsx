import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { Calendar, Folder, Briefcase } from 'lucide-react';

const Sidebar = () => (
  <div className="bg-white shadow-sm d-flex flex-column p-3" style={{ width: '250px', minHeight: '100vh' }}>
    <h5 className="fw-bold mb-4">Lawyerly Dashboard</h5>
    <Nav className="flex-column gap-2">
      <Nav.Link className="d-flex align-items-center gap-2 text-dark"><Briefcase size={18} /> My Cases</Nav.Link>
      <Nav.Link className="d-flex align-items-center gap-2 text-dark"><Calendar size={18} /> Calendar</Nav.Link>
      <Nav.Link className="d-flex align-items-center gap-2 text-primary bg-light rounded px-2 py-1 fw-semibold">
        <Folder size={18} /> Documents
      </Nav.Link>
    </Nav>
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="d-flex flex-column min-vh-100 bg-light">
    <main className="flex-grow-1">
      {children}
    </main>
  </div>
);

export default DashboardLayout;
