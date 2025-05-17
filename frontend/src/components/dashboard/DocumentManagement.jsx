'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Form,
  ListGroup,
  Spinner,
  Card,
  Row,
  Col,
  InputGroup,
  Image as RBImage
} from 'react-bootstrap';
import {
  Folder,
  FileText,
  DownloadCloud,
  Eye,
  UploadCloud,
  Search,
  Filter,
  FileImage,
  FileText as FileTextIcon
} from 'lucide-react';

const initialDocuments = [];
 

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentDates, setCurrentDates] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const sortedDocs = [...initialDocuments].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    setDocuments(sortedDocs);
    const dates = {};
    sortedDocs.forEach(doc => {
      dates[doc.id] = doc.uploadDate.toLocaleDateString();
    });
    setCurrentDates(dates);
  }, []);

useEffect(() => {
  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();

      const docsWithDateObjects = data.documents.map((doc, index) => ({
        id: `doc-${index}`, // Generate a temporary ID
        name: doc.documenttitle || 'Untitled',
        type: doc.documenttype?.toLowerCase().includes('folder') ? 'folder' : 'file', // Adjust this logic based on types
        uploadDate: new Date(doc.uploaddate),
        size: doc.size || null // Optional: handle size if backend sends it
      }));

      const sortedDocs = docsWithDateObjects.sort(
        (a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()
      );

      setDocuments(sortedDocs);

      const dates = {};
      sortedDocs.forEach(doc => {
        dates[doc.id] = doc.uploadDate.toLocaleDateString();
      });
      setCurrentDates(dates);
    } catch (error) {
      console.error(error);
    }
  }

  fetchDocuments();
}, []);


const handleFileUpload = useCallback(async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  setIsUploading(true);

  const newDocs = Array.from(files).map((file, index) => ({
    id: `new-${Date.now()}-${index}`,
    name: file.name,
    type: 'file',
    uploadDate: new Date(),
    size: file.size,
    fileObj: file
  }));

  for (let doc of newDocs) {
    const payload = {
      documenttitle: doc.name,
      documenttype: 'file',
      lawyerid: 1, // Replace with dynamic lawyer ID
      uploaddate: doc.uploadDate.toISOString(),
      size: doc.size
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error('Failed to upload document to server');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  }

  setDocuments(prevDocs => {
    const updatedDocs = [...newDocs, ...prevDocs].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    const newDates = { ...currentDates };
    newDocs.forEach(doc => {
      newDates[doc.id] = doc.uploadDate.toLocaleDateString();
    });
    setCurrentDates(newDates);
    return updatedDocs;
  });

  setIsUploading(false);
  event.target.value = '';
}, [currentDates]);

  const handleDownload = (doc) => {
    if (doc.type === 'folder') {
      alert('Cannot download folders.');
      return;
    }
    alert(`Download started for ${doc.name}`);
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
  };

  const closePanel = () => {
    setSelectedDoc(null);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };

  const filteredDocuments = documents.filter(doc => {
  const name = doc.name || ''; // Ensure we always have a string
  const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesFilter = filterType === 'all' || doc.type === filterType;
  return matchesSearch && matchesFilter;
});



  // Helper to check if a file is an image
  const isImage = (name) => /\.(jpg|jpeg|png|gif)$/i.test(name);

  return (
    <Row className="h-100 g-4 justify-content-center align-items-start">
      <Col md={selectedDoc ? 7 : 10} className="d-flex flex-column align-items-center">
        <Card className="shadow-sm rounded-4 w-100" style={{ maxWidth: 900 }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0 text-primary">Document Management</h4>
              <Form.Group className="mb-0">
                <Form.Label htmlFor="file-upload-input" className="d-block mb-0 w-auto">
                  <Button
                    variant="primary"
                    as="span"
                    size="lg"
                    className="d-flex align-items-center gap-2 px-4 py-2"
                    style={{ fontSize: '1.1rem', borderRadius: '1.5rem' }}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : (
                      <UploadCloud className="me-2" size={22} />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Documents'}
                  </Button>
                </Form.Label>
                <Form.Control
                  id="file-upload-input"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png,.eml,.xls,.xlsx,.ppt,.pptx"
                  className="d-none"
                />
              </Form.Group>
            </div>
            <Row className="g-2 mb-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={16} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <Filter size={16} />
                  </InputGroup.Text>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="file">Files Only</option>
                    <option value="folder">Folders Only</option>
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
            <div className="flex-grow-1 overflow-auto">
              {filteredDocuments.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredDocuments.map((doc) => (
                    <ListGroup.Item
                      key={doc.id}
                      className="d-flex align-items-center justify-content-between px-3 py-2 bg-white border-bottom rounded-3 mb-2 shadow-sm"
                      style={{ transition: 'background-color 0.2s ease-in-out', cursor: 'pointer' }}
                      onClick={() => handleView(doc)}
                    >
                      <div className="d-flex align-items-center gap-2 overflow-hidden me-2" style={{ minWidth: 0 }}>
                        {doc.type === 'folder' ? (
                          <Folder className="text-primary flex-shrink-0" size={20} />
                        ) : (
                          <FileText className="text-secondary flex-shrink-0" size={20} />
                        )}
                        <span className="text-truncate fw-medium" style={{ color: '#333' }}>{doc.name}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {doc.size && <small className="text-muted d-none d-sm-inline-block">{formatBytes(doc.size)}</small>}
                        <small className="text-muted d-none d-md-inline-block">{currentDates[doc.id]}</small>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleView(doc); }}
                          className="p-1 lh-1"
                          title={doc.type === 'folder' ? "Open folder" : "View document"}
                        >
                          <Eye size={16} />
                        </Button>
                        {doc.type === 'file' && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                            className="p-1 lh-1"
                            title="Download"
                          >
                            <DownloadCloud size={16} />
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted fs-5">No documents found. Click "Upload Documents" to begin.</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
      {/* Right-side document preview panel */}
      {selectedDoc && (
        <Col md={5} className="d-flex flex-column align-items-center">
          <Card className="shadow-sm rounded-4 w-100" style={{ maxWidth: 400, minHeight: 300 }}>
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
              <div className="w-100 text-end mb-2">
                <Button variant="outline-secondary" size="sm" onClick={closePanel}>&times; Close</Button>
              </div>
              <h5 className="mb-3">{selectedDoc.name}</h5>
              {isImage(selectedDoc.name) ? (
                <RBImage src={selectedDoc.fileObj ? URL.createObjectURL(selectedDoc.fileObj) : undefined} alt={selectedDoc.name} fluid className="w-100 mb-3" style={{ maxHeight: 200, objectFit: 'contain' }} />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center mb-3" style={{ minHeight: 120 }}>
                  <FileTextIcon size={48} className="mb-3 text-secondary" />
                  <p className="mb-2">Preview not available for this file type.</p>
                </div>
              )}
              <div className="d-flex gap-2 align-items-center mb-2">
                {selectedDoc.size && <span className="badge bg-light text-dark">{formatBytes(selectedDoc.size)}</span>}
                <span className="badge bg-light text-dark">{currentDates[selectedDoc.id]}</span>
              </div>
              <Button variant="primary" href="#" onClick={() => alert('Download started!')}>Download</Button>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default DocumentManagement;
