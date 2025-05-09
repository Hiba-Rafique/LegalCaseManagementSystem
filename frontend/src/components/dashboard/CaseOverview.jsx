import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Table,
  Card,
  Badge,
} from 'react-bootstrap';
import { Search, FunnelFill } from 'react-bootstrap-icons';
import { format } from 'date-fns';

const getCases = () => [
  {
    id: 'case1',
    caseName: 'Smith v. Jones Construction LLC',
    client: 'Johnathan P. Smith',
    opposingCounsel: 'Jane R. Doe, Esq.',
    status: 'Open',
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    caseType: 'Civil Litigation',
    court: 'Superior Court, Anytown',
    priority: 'High',
  },
  {
    id: 'case2',
    caseName: 'Acme Corp v. Beta Innovations Inc.',
    client: 'Acme Corporation (Rep: T. Stark)',
    opposingCounsel: 'Robert "Bob" Paulson III',
    status: 'Pending Discovery',
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    caseType: 'Intellectual Property',
    court: 'Federal District Court',
    priority: 'Medium',
  },
  {
    id: 'case3',
    caseName: 'State of Confusion v. Michael "Mikey" Miller',
    client: 'Michael Miller (Pro Bono)',
    opposingCounsel: "District Attorney's Office",
    status: 'In Trial',
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    caseType: 'Criminal Defense',
    court: 'Criminal Court, Div A',
    priority: 'Critical',
  },
  {
    id: 'case4',
    caseName: 'Chen Family Living Trust Admin',
    client: 'Sarah Chen & Family',
    opposingCounsel: 'N/A (Estate Planning)',
    status: 'Closed - Archived',
    lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    caseType: 'Estate Planning',
    court: 'N/A',
    priority: 'Low',
  },
  {
    id: 'case5',
    caseName: 'Innovate LLC Patent Dispute',
    client: 'Innovate Dynamics LLC',
    opposingCounsel: 'Global Tech Law Group LLP',
    status: 'Open',
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    caseType: 'Patent Litigation',
    court: 'USPTO PTAB',
    priority: 'High',
  },
  {
    id: 'case6',
    caseName: 'Real Estate Transaction - Miller Property',
    client: 'The Miller Family',
    opposingCounsel: "Buyer's Counsel",
    status: 'Pending Closing',
    lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    caseType: 'Real Estate',
    court: 'N/A',
    priority: 'Medium',
  },
];

const CaseOverview = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState('lastActivity');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activityDates, setActivityDates] = useState({});

  useEffect(() => {
    const fetchedCases = getCases();
    setCases(fetchedCases);
    const dates = {};
    fetchedCases.forEach((c) => {
      dates[c.id] = format(c.lastActivity, 'MM/dd/yyyy');
    });
    setActivityDates(dates);
    setLoading(false);
  }, []);

  const handleSort = (key) => {
    if (!key) return;

    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter((c) => {
      const searchText = filterText.toLowerCase();
      const matchesText =
        c.caseName.toLowerCase().includes(searchText) ||
        c.client.toLowerCase().includes(searchText) ||
        (c.opposingCounsel &&
          c.opposingCounsel.toLowerCase().includes(searchText)) ||
        c.caseType.toLowerCase().includes(searchText);

      const matchesStatus =
        filterStatus === 'All' || c.status === filterStatus;

      return matchesText && matchesStatus;
    });

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;
        if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [cases, filterText, filterStatus, sortKey, sortDirection]);

  const getStatusBadgeVariant = (status) => {
    if (status.toLowerCase().includes('open')) return 'primary';
    if (status.toLowerCase().includes('pending')) return 'warning';
    if (status.toLowerCase().includes('trial')) return 'danger';
    if (status.toLowerCase().includes('closed')) return 'secondary';
    return 'info';
  };

  const allStatuses = useMemo(() => {
    const uniqueStatuses = new Set(cases.map((c) => c.status));
    return ['All', ...Array.from(uniqueStatuses)];
  }, [cases]);

  return (
    <Container fluid className="py-4">
      <Card className="mb-4 shadow">
        <Card.Header as="h5">My Cases</Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search cases, clients, counsel..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FunnelFill />
                </InputGroup.Text>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {allStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table bordered hover striped>
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort('caseName')}>Case Name</th>
                  <th onClick={() => handleSort('client')}>Client</th>
                  <th onClick={() => handleSort('opposingCounsel')}>Opposing Counsel</th>
                  <th onClick={() => handleSort('status')}>Status</th>
                  <th onClick={() => handleSort('caseType')}>Case Type</th>
                  <th onClick={() => handleSort('lastActivity')}>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Loading cases...
                    </td>
                  </tr>
                ) : filteredAndSortedCases.length > 0 ? (
                  filteredAndSortedCases.map((c) => (
                    <tr key={c.id}>
                      <td>{c.caseName}</td>
                      <td>{c.client}</td>
                      <td>{c.opposingCounsel}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(c.status)}>
                          {c.status}
                        </Badge>
                      </td>
                      <td>{c.caseType}</td>
                      <td>{activityDates[c.id]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No cases found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CaseOverview;
