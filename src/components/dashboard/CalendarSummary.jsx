import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button, Modal, Form } from 'react-bootstrap';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CalendarSummary.css';

const EVENT_TYPES = [
  { label: 'Court Date', value: 'Court Date' },
  { label: 'Meeting', value: 'Meeting' },
  { label: 'Deadline', value: 'Deadline' },
];

const CalendarSummary = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    date: moment().format('YYYY-MM-DD'),
    time: '',
    type: 'Court Date',
    location: '',
    description: '',
  });
  const [addFormError, setAddFormError] = useState('');

  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'Court Hearing - Smith v. Jones',
        date: moment().date(10),
        time: '10:00 AM',
        type: 'Court Date',
        location: 'Courtroom 3B',
        description: 'Initial hearing for Smith v. Jones case',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Client Meeting - Sarah Chen',
        date: moment().date(9),
        time: '2:30 PM',
        type: 'Meeting',
        location: 'Office Conference Room',
        description: 'Discuss case strategy',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Document Filing Deadline',
        date: moment().date(11),
        time: '5:00 PM',
        type: 'Deadline',
        location: 'Online Portal',
        description: 'Submit motion to dismiss',
        priority: 'high'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const getDaysInMonth = () => {
    const daysInMonth = currentDate.daysInMonth();
    const firstDayOfMonth = moment(currentDate).startOf('month');
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth.day(); i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(moment(currentDate).date(i));
    }
    
    // Add empty cells to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    return events.filter(event => event.date.isSame(day, 'day'));
  };

  const getEventBadgeVariant = (type) => {
    switch (type) {
      case 'Court Date': return 'danger';
      case 'Meeting': return 'primary';
      case 'Deadline': return 'warning';
      default: return 'info';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };

  const handleDayClick = (day) => {
    if (day) setSelectedDate(day.clone());
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const isToday = (day) => {
    return day && day.isSame(moment(), 'day');
  };

  // Add Event Modal Handlers
  const handleAddEventOpen = () => {
    setAddForm({
      title: '',
      date: selectedDate.format('YYYY-MM-DD'),
      time: '',
      type: 'Court Date',
      location: '',
      description: '',
    });
    setAddFormError('');
    setShowAddModal(true);
  };

  const handleAddFormChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.date || !addForm.time) {
      setAddFormError('Title, date, and time are required.');
      return;
    }
    const newEvent = {
      id: Date.now(),
      title: addForm.title,
      date: moment(addForm.date),
      time: addForm.time,
      type: addForm.type,
      location: addForm.location,
      description: addForm.description,
      priority: addForm.type === 'Deadline' ? 'high' : 'medium',
    };
    setEvents([...events, newEvent]);
    setShowAddModal(false);
    setSelectedDate(moment(addForm.date));
  };

  const selectedEvents = getEventsForDay(selectedDate);

  return (
    <div className="calendar-container p-2 p-md-3 p-lg-4">
      <Row className="g-3 g-lg-4 justify-content-center align-items-stretch">
        {/* Calendar Card - now wider */}
        <Col xs={12} md={7} lg={8} xl={8} xxl={9}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <Button
                    variant="light"
                    className="rounded-circle p-2"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <h4 className="mb-0 fw-bold">{currentDate.format('MMMM YYYY')}</h4>
                  <Button
                    variant="light"
                    className="rounded-circle p-2"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAddEventOpen}>
                  <Plus size={16} />
                  Add Event
                </Button>
              </div>

              <div className="calendar-grid">
                <div className="calendar-header">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-cell header">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="calendar-body">
                  {getDaysInMonth().map((day, idx) => {
                    const isSelected = day && day.isSame(selectedDate, 'day');
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div
                        key={idx}
                        className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                        onClick={() => handleDayClick(day)}
                      >
                        {day && (
                          <>
                            <div className="date-number">{day.date()}</div>
                            {hasEvents && (
                              <div className="events-preview">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div
                                    key={event.id}
                                    className="event-dot"
                                    style={{ backgroundColor: `var(--bs-${getEventBadgeVariant(event.type)})` }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEventClick(event);
                                    }}
                                  />
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="more-events">+{dayEvents.length - 2}</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Events Panel - now wider */}
        <Col xs={12} md={5} lg={4} xl={4} xxl={3}>
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-3 p-md-4">
              <h5 className="mb-4 fw-bold">
                {selectedDate.format('dddd, MMMM Do')}
              </h5>
              {selectedEvents.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <CalendarIcon size={48} className="mb-3 opacity-50" />
                  <p className="mb-0">No events scheduled for this day</p>
                </div>
              ) : (
                <ListGroup variant="flush" className="events-list">
                  {selectedEvents.map(event => (
                    <ListGroup.Item
                      key={event.id}
                      className="border-0 mb-3 p-3 rounded-3 shadow-sm"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg={getEventBadgeVariant(event.type)}>{event.type}</Badge>
                        <span className="fw-bold">{event.title}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Clock size={16} className="text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Event Details Modal */}
      <Modal
        show={showEventModal}
        onHide={() => setShowEventModal(false)}
        centered
        className="event-modal"
      >
        {selectedEvent && (
          <>
            <Modal.Header closeButton className="border-0">
              <Modal.Title>
                <Badge bg={getEventBadgeVariant(selectedEvent.type)} className="mb-2">
                  {selectedEvent.type}
                </Badge>
                <h5 className="mb-0">{selectedEvent.title}</h5>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Clock size={20} className="text-primary" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <MapPin size={20} className="text-primary" />
                <span>{selectedEvent.location}</span>
              </div>
              <p className="mb-0">{selectedEvent.description}</p>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                Close
              </Button>
              <Button variant="primary">Edit Event</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Add Event Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddEventSubmit}>
          <Modal.Body>
            {addFormError && <div className="alert alert-danger py-2">{addFormError}</div>}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={addForm.title}
                onChange={handleAddFormChange}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={addForm.date}
                onChange={handleAddFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={addForm.time}
                onChange={handleAddFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={addForm.type}
                onChange={handleAddFormChange}
              >
                {EVENT_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={addForm.location}
                onChange={handleAddFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={addForm.description}
                onChange={handleAddFormChange}
                rows={2}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Event
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarSummary;
