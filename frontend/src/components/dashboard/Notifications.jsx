import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, ListGroup } from 'react-bootstrap';
import { Bell, Check, Clock, AlertCircle, Info } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulated notifications data
    const initialNotifications = [
      {
        id: 1,
        title: 'New Case Assignment',
        message: 'You have been assigned to case #12345',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false
      },
      {
        id: 2,
        title: 'Document Upload',
        message: 'New evidence documents have been uploaded to case #12345',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 3,
        title: 'Court Hearing Reminder',
        message: 'Upcoming hearing for case #12345 in 2 days',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      },
      {
        id: 4,
        title: 'Client Message',
        message: 'New message from John Doe regarding case #12345',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
      }
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="text-success" size={16} />;
      case 'warning':
        return <AlertCircle className="text-warning" size={16} />;
      case 'error':
        return <AlertCircle className="text-danger" size={16} />;
      default:
        return <Info className="text-info" size={16} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  ));

  return (
    <Dropdown align="end">
      <Dropdown.Toggle as={CustomToggle}>
        <div className="position-relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute"
              style={{
                top: -5,
                right: -5,
                fontSize: '0.7rem',
                padding: '0.25rem 0.4rem'
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: 0
        }}
      >
        <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-link btn-sm text-decoration-none p-0"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <ListGroup variant="flush">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                className={`p-2 ${!notification.read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="d-flex gap-2">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1">{notification.title}</h6>
                      <small className="text-muted">
                        {formatTimestamp(notification.timestamp)}
                      </small>
                    </div>
                    <p className="mb-0 small text-muted">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center py-3">
              <Clock size={24} className="text-muted mb-2" />
              <p className="text-muted mb-0">No notifications</p>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Notifications; 