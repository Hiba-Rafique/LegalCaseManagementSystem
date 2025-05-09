import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import { User, Mail, Phone, MapPin, Briefcase, Award, Edit2, Upload } from 'lucide-react';

const PROFILE_IMAGE_KEY = 'lawyerProfileImage';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    specialization: 'Corporate Law',
    barNumber: 'NY123456',
    experience: '15 years',
    cnic: '12345-6789012-3',
    dateOfBirth: '1985-05-15',
    barLicenseNo: 'BAR-2023-12345',
    barCouncil: 'New York State Bar Association',
    barYear: '2008',
    practiceAreas: ['Corporate Law', 'Mergers & Acquisitions', 'Commercial Litigation'],
    bio: 'Experienced corporate lawyer specializing in mergers and acquisitions, with a track record of successful high-profile cases.',
    education: [
      { degree: 'Juris Doctor', school: 'Harvard Law School', year: '2008' },
      { degree: 'Bachelor of Arts in Political Science', school: 'Yale University', year: '2005' }
    ],
    certifications: [
      'New York State Bar',
      'American Bar Association',
      'International Bar Association'
    ]
  });

  useEffect(() => {
    // Load profile image from localStorage if available
    const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    if (storedImage) setProfileImage(storedImage);
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(PROFILE_IMAGE_KEY, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {/* Profile Header */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <Image
                  src={profileImage || "https://via.placeholder.com/150"}
                  roundedCircle
                  width={150}
                  height={150}
                  className="border border-4 border-primary"
                  style={{ objectFit: 'cover' }}
                />
                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0 rounded-circle"
                    style={{ width: '32px', height: '32px' }}
                    onClick={triggerImageUpload}
                  >
                    <Upload size={16} />
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="d-none"
                />
              </div>
              <h4 className="mb-1">{profileData.fullName}</h4>
              <p className="text-muted mb-3">{profileData.specialization}</p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <Button variant="outline-primary" size="sm">
                  <Mail size={16} className="me-1" /> Email
                </Button>
                <Button variant="outline-primary" size="sm">
                  <Phone size={16} className="me-1" /> Call
                </Button>
              </div>
              <hr />
              <div className="text-start">
                <p className="mb-2">
                  <MapPin size={16} className="me-2 text-primary" />
                  {profileData.location}
                </p>
                <p className="mb-2">
                  <Briefcase size={16} className="me-2 text-primary" />
                  {profileData.experience} Experience
                </p>
                <p className="mb-0">
                  <Award size={16} className="me-2 text-primary" />
                  Bar Number: {profileData.barNumber}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Details */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Professional Information</h5>
                <Button
                  variant={isEditing ? "success" : "outline-primary"}
                  size="sm"
                  onClick={isEditing ? handleSave : handleEdit}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>

              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.fullName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profileData.email}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profileData.phone}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.location}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>CNIC</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.cnic}
                        disabled={true}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={profileData.dateOfBirth}
                        disabled={true}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Bar License Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.barLicenseNo}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, barLicenseNo: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Bar Council</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.barCouncil}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, barCouncil: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Year of Bar Admission</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.barYear}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, barYear: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Practice Areas</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.practiceAreas.join(', ')}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, practiceAreas: e.target.value.split(', ')})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={profileData.bio}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Education & Certifications */}
          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Education</h5>
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="mb-3">
                      <h6 className="mb-1">{edu.degree}</h6>
                      <p className="text-muted mb-1">{edu.school}</p>
                      <small className="text-muted">{edu.year}</small>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Certifications</h5>
                  <ul className="list-unstyled mb-0">
                    {profileData.certifications.map((cert, index) => (
                      <li key={index} className="mb-2">
                        <Award size={16} className="me-2 text-primary" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 