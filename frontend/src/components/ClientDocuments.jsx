import React, { useState, useRef } from 'react';
import { Card, Row, Col, ListGroup, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { Folder, FileText, Eye, UploadCloud, FileImage } from 'lucide-react';

const initialDocuments = [
  {
    id: 1,
    title: 'Charge Sheet',
    category: 'Legal Documents',
    uploadDate: '2024-03-15',
    size: '2.5 MB',
    type: 'PDF',
    path: '/docs/charge_sheet.pdf',
    fileType: 'pdf',
  },
  {
    id: 2,
    title: 'Forensic Report',
    category: 'Evidence',
    evidenceType: 'Document',
    description: 'Forensic analysis of crime scene',
    date: '2024-03-16',
    caseName: 'State v. Smith',
    size: '1.8 MB',
    type: 'PDF',
    path: '/docs/forensic_report.pdf',
    fileType: 'pdf',
  },
  {
    id: 3,
    title: 'Photo Evidence',
    category: 'Evidence',
    evidenceType: 'Photo',
    description: 'Photo of the crime scene',
    date: '2024-03-17',
    caseName: 'State v. Smith',
    size: '1.2 MB',
    type: 'JPG',
    path: '/docs/evidence_photo1.jpg',
    fileType: 'image',
  },
  {
    id: 4,
    title: 'Witness Statement',
    category: 'Statements',
    firstName: 'Ali',
    lastName: 'Khan',
    cnic: '12345-6789012-3',
    phone: '0300-1234567',
    email: 'ali.khan@email.com',
    pastHistory: 'No prior criminal record',
    statement: 'I saw the accused at the scene.',
    caseName: 'State v. Smith',
    date: '2024-03-18',
    size: '0.8 MB',
    type: 'PDF',
    path: '/docs/witness_statement.pdf',
    fileType: 'pdf',
  },
  {
    id: 5,
    title: 'Court Order',
    category: 'Legal Documents',
    uploadDate: '2024-03-18',
    size: '0.8 MB',
    type: 'PDF',
    path: '/docs/court_order.pdf',
    fileType: 'pdf',
  }
];

const categories = ['Legal Documents', 'Evidence', 'Statements'];

function ClientDocuments() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState('Legal Documents');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addFile, setAddFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const fileInputRef = useRef();

  const filteredDocuments = documents.filter(doc => doc.category === selectedCategory);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!addTitle || !addFile) return;
    setAddLoading(true);
    // Simulate upload
    setTimeout(() => {
      const fileType = addFile.type.startsWith('image') ? 'image' : (addFile.type === 'application/pdf' ? 'pdf' : 'file');
      const newDoc = {
        id: Date.now(),
        title: addTitle,
        category: 'Legal Documents',
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(addFile.size / 1024 / 1024).toFixed(1)} MB`,
        type: addFile.name.split('.').pop().toUpperCase(),
        path: URL.createObjectURL(addFile),
        fileType,
      };
      setDocuments([newDoc, ...documents]);
      setAddTitle('');
      setAddFile(null);
      setAddLoading(false);
      setShowAddModal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1000);
  };

  const handleView = (doc) => {
    setViewDoc(doc);
    setShowViewModal(true);
  };

    return (
    <Row className="h-100 g-4 justify-content-center align-items-start">
      <Col md={3} className="d-flex flex-column">
        <Card className="shadow-sm rounded-4 w-100 flex-grow-1 mb-0">
          <Card.Body className="p-4">
            <h4 className="mb-4">Categories</h4>
            <ListGroup>
              {categories.map(category => (
                <ListGroup.Item
                  key={category}
                  action
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className="border-0 mb-2 rounded"
                >
                  {category}
                </ListGroup.Item>
              ))}
            </ListGroup>
            {selectedCategory === 'Legal Documents' && (
              <Button
                variant="primary"
                className="mt-4 w-100 d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <UploadCloud size={18} /> Add Legal Document
              </Button>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={9} className="d-flex flex-column">
        <Card className="shadow-sm rounded-4 w-100 flex-grow-1 mb-0">
          <Card.Body className="p-4">
            <h4 className="mb-4">Documents</h4>
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Upload Date</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No documents found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map(doc => (
                      <tr key={doc.id}>
                        <td>{doc.title}</td>
                        <td><Badge bg="secondary">{doc.category}</Badge></td>
                        <td>{doc.uploadDate}</td>
                        <td>{doc.size}</td>
                        <td><Badge bg="info">{doc.type}</Badge></td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleView(doc)}
                                    >
                            <Eye size={16} className="me-1" /> View
                          </Button>
                                </td>
                            </tr>
                    ))
                  )}
                    </tbody>
                </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      {/* Add Legal Document Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Legal Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddDocument}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={addTitle}
                onChange={e => setAddTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>File Upload</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={e => setAddFile(e.target.files[0])}
                ref={fileInputRef}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={addLoading}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={addLoading}>
              {addLoading ? <Spinner size="sm" animation="border" /> : 'Add Document'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* View Document Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewDoc && (
            <div>
              {viewDoc.category === 'Evidence' ? (
                <>
                  <div className="mb-3"><strong>Evidence Type:</strong> {viewDoc.evidenceType}</div>
                  <div className="mb-3"><strong>Description:</strong> {viewDoc.description}</div>
                  <div className="mb-3"><strong>Date:</strong> {viewDoc.date}</div>
                  <div className="mb-3"><strong>Case Name:</strong> {viewDoc.caseName}</div>
                </>
              ) : viewDoc.category === 'Statements' ? (
                <>
                  <div className="mb-3"><strong>First Name:</strong> {viewDoc.firstName}</div>
                  <div className="mb-3"><strong>Last Name:</strong> {viewDoc.lastName}</div>
                  <div className="mb-3"><strong>CNIC:</strong> {viewDoc.cnic}</div>
                  <div className="mb-3"><strong>Phone:</strong> {viewDoc.phone}</div>
                  <div className="mb-3"><strong>Email Address:</strong> {viewDoc.email}</div>
                  <div className="mb-3"><strong>Past History:</strong> {viewDoc.pastHistory}</div>
                  <div className="mb-3"><strong>Statement:</strong> {viewDoc.statement}</div>
                  <div className="mb-3"><strong>Case Name:</strong> {viewDoc.caseName}</div>
                  <div className="mb-3"><strong>Date:</strong> {viewDoc.date}</div>
                </>
              ) : (
                <>
                  <div className="mb-3"><strong>Title:</strong> {viewDoc.title}</div>
                  <div className="mb-3"><strong>Category:</strong> {viewDoc.category}</div>
                  <div className="mb-3"><strong>Upload Date:</strong> {viewDoc.uploadDate}</div>
                  <div className="mb-3"><strong>Type:</strong> {viewDoc.type}</div>
                  <div className="mb-3"><strong>Size:</strong> {viewDoc.size}</div>
                </>
              )}
              {viewDoc.fileType === 'image' ? (
                <div className="text-center">
                  <img src={viewDoc.path} alt={viewDoc.title} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }} />
                </div>
              ) : viewDoc.fileType === 'pdf' ? (
                <div className="text-center">
                  <iframe src={viewDoc.path} title="PDF Preview" width="100%" height="400px" style={{ border: 'none', borderRadius: 8 }}></iframe>
                  <div className="mt-2">
                    <a href={viewDoc.path} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Open in new tab</a>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <a href={viewDoc.path} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">Download File</a>
                </div>
              )}
        </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Row>
    );
}

export default ClientDocuments;