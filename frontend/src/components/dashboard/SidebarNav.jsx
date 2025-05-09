import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Briefcase, Calendar3, Folder, Person } from 'react-bootstrap-icons';

const navItems = [
  { view: 'cases', label: 'My Cases', icon: <Briefcase className="me-2" /> },
  { view: 'calendar', label: 'Calendar', icon: <Calendar3 className="me-2" /> },
  { view: 'documents', label: 'Documents', icon: <Folder className="me-2" /> },
  // { view: 'profile', label: 'Profile', icon: <Person className="me-2" /> }, // Optional
];

const SidebarNav = ({ activeView, onViewChange, className = '' }) => {
  return (
    <ListGroup variant="flush" className={`d-flex flex-column gap-1 ${className}`}>
      {navItems.map((item) => (
        <ListGroup.Item
          key={item.view}
          action
          onClick={() => onViewChange(item.view)}
          active={activeView === item.view}
          className={`d-flex align-items-center px-3 py-2 rounded-0 border-0 ${
            activeView === item.view 
              ? 'bg-primary text-white fw-medium' 
              : 'text-dark hover-bg-light'
          }`}
          style={{
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            borderLeft: activeView === item.view ? '4px solid #0d6efd' : '4px solid transparent'
          }}
        >
          {item.icon}
          {item.label}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default SidebarNav;
