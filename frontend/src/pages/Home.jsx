import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Navbar,
  Nav,
  Card,
  Image
} from 'react-bootstrap';

// Simple SVG Icons (as placeholders, consider using a library like Bootstrap Icons later if needed)
const CaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-briefcase-fill mb-3 text-primary" viewBox="0 0 16 16">
    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13A1.5 1.5 0 0 0 16 12.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-calendar-check-fill mb-3 text-primary" viewBox="0 0 16 16">
    <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-5.146-5.146-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
  </svg>
);

const SecurityIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-shield-lock-fill mb-3 text-primary" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.52 1.52 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.52 1.52 0 0 0-1.044-1.262c-.658-.215-1.777-.57-2.887-.87C9.843.265 8.69 0 8 0m0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.966a.5.5 0 0 1-.491.575h-.788a.5.5 0 0 1-.49-.575l.384-1.966A1.5 1.5 0 0 1 8 5"/>
  </svg>
);


const Home = () => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-briefcase me-2" viewBox="0 0 16 16">
               <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13A1.5 1.5 0 0 0 16 12.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5"/>
             </svg>
             LegalEase
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/login" className="btn btn-outline-light me-lg-2 mb-2 mb-lg-0">Login</Nav.Link>
              <Nav.Link as={Link} to="/signup" className="btn btn-primary">Sign Up</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <div style={{ flex: 1, width: '100%', height: '100%', overflowY: 'auto', minHeight: 0 }}>
      <div className="hero-section bg-light text-dark py-5 w-100" style={{ minHeight: '480px' }}>
          <Container fluid>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0 text-center text-md-start">
              <h1 className="display-4 fw-bold mb-3 text-primary">Simplify Your Case Management</h1>
              <p className="lead mb-4">
                LegalEase offers a modern, intuitive platform designed for legal professionals. Streamline workflows, manage clients, and access documents securely—anytime, anywhere.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <Link to="/signup" className="btn btn-primary btn-lg px-4 me-md-2">Get Started</Link>
                <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">Login</Link>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <Image
                src="https://picsum.photos/seed/legaltech/600/400"
                alt="Modern legal technology interface"
                rounded
                fluid
                className="shadow-lg w-100"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
                data-ai-hint="legal technology software interface chart dashboard analytics screen"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">Why Legal Professionals Choose LegalEase</h2>
              <p className="lead text-muted">Powerful features designed for efficiency and security.</p>
            </Col>
          </Row>
          <Row className="g-4 justify-content-center">
            {/* Feature 1 */}
            <Col md={6} lg={4} className="d-flex align-items-stretch">
              <Card className="text-center shadow-sm border-0 hover-lift w-100">
                 <Card.Body className="p-4 d-flex flex-column">
                  <CaseIcon />
                  <Card.Title as="h5" className="fw-bold mb-2">Intelligent Case Organization</Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    Keep all case details, documents, deadlines, and client communications organized and easily accessible.
                  </Card.Text>
                  <Button variant="outline-primary" size="sm" className="mt-auto align-self-center stretched-link">Learn More</Button>
                </Card.Body>
              </Card>
            </Col>
            {/* Feature 2 */}
            <Col md={6} lg={4} className="d-flex align-items-stretch">
              <Card className="text-center shadow-sm border-0 hover-lift w-100">
                 <Card.Body className="p-4 d-flex flex-column">
                  <CalendarIcon />
                  <Card.Title as="h5" className="fw-bold mb-2">Automated Calendaring</Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    Never miss a deadline. Track court dates, client meetings, and tasks with automated reminders and alerts.
                  </Card.Text>
                   <Button variant="outline-primary" size="sm" className="mt-auto align-self-center stretched-link">Learn More</Button>
                </Card.Body>
              </Card>
            </Col>
            {/* Feature 3 */}
            <Col md={6} lg={4} className="d-flex align-items-stretch">
              <Card className="text-center shadow-sm border-0 hover-lift w-100">
                 <Card.Body className="p-4 d-flex flex-column">
                  <SecurityIcon />
                  <Card.Title as="h5" className="fw-bold mb-2">Bank-Grade Security</Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    Protect sensitive client data with end-to-end encryption and secure cloud storage. Compliance built-in.
                  </Card.Text>
                  <Button variant="outline-primary" size="sm" className="mt-auto align-self-center stretched-link">Learn More</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section bg-primary text-white text-center py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="fw-bold mb-3">Ready to Transform Your Practice?</h2>
              <p className="lead mb-4">Join LegalEase today and experience the future of legal case management.</p>
              <Link to="/signup" className="btn btn-light btn-lg shadow-sm px-5">Start Your Free Trial</Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white mt-auto py-4">
         <Container>
            <Row className="align-items-center">
              <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
                 <small>&copy; {new Date().getFullYear()} LegalEase. All Rights Reserved.</small>
              </Col>
              <Col md={6} className="text-center text-md-end">
                 <Link to="/privacy" className="text-white-50 mx-2 text-decoration-none small">Privacy Policy</Link>
                 <span className="text-white-50">|</span>
                 <Link to="/terms" className="text-white-50 ms-2 text-decoration-none small">Terms of Service</Link>
              </Col>
            </Row>
         </Container>
      </footer>
      </div>

      {/* Basic CSS for hover effect (can be moved to a CSS file) */}
      <style>{`
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 .75rem 1.5rem rgba(0,0,0,.1)!important;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hero-section {
          background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
        }
        .cta-section {
           background: linear-gradient(to right, #0d6efd, #0b5ed7);
        }
      `}</style>
    </div>
  );
};

export default Home;