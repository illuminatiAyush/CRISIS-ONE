// app/services/mockDataService.ts

import {
  AnalyticsData,
  Incident,
  Resource,
  Alert,
  IncidentCategory,
  ResourceType,
  SystemEvent,
  User,       // Added
  UserRole    // Added
} from '@/app/types';

// Event Bus Implementation for Real-time Updates simulation
type EventHandler = (event: SystemEvent) => void;

class EventService {
  private listeners: EventHandler[] = [];

  subscribe(handler: EventHandler) {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter(h => h !== handler);
    };
  }

  emit(event: SystemEvent) {
    this.listeners.forEach(handler => handler(event));
  }
}

export const eventService = new EventService();

// --- MOCK DATA STORE ---
let MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    category: 'Fire',
    severity: 'Critical',
    status: 'In Progress',
    location: { lat: 40.7128, lon: -74.0060, address: 'Downtown Metro Station' },
    description: 'Large structural fire reported at central station',
    reporterId: 'user-1',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    lastUpdated: new Date(),
    estimatedAffected: 150
  },
  {
    id: '2',
    category: 'Medical',
    severity: 'High',
    status: 'Reported',
    location: { lat: 40.7589, lon: -73.9851, address: 'Times Square' },
    description: 'Multiple injuries reported after collision',
    reporterId: 'user-2',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    lastUpdated: new Date(),
    estimatedAffected: 12
  },
  {
    id: '3',
    category: 'Flood',
    severity: 'Medium',
    status: 'Resolved',
    location: { lat: 40.7829, lon: -73.9654, address: 'Central Park Lake' },
    description: 'Water overflow affecting pedestrian paths',
    reporterId: 'user-3',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    lastUpdated: new Date(),
    estimatedAffected: 0
  }
];

let MOCK_RESOURCES: Resource[] = [
  {
    id: 'r1',
    type: 'Medical',
    name: 'Ambulance Unit A',
    status: 'Available',
    capacity: 4,
    currentLoad: 0,
    location: { lat: 40.7300, lon: -73.9950 },
    managerId: 'admin-1',
    lastUpdated: new Date()
  },
  {
    id: 'r2',
    type: 'Volunteers',
    name: 'Rapid Response Team',
    status: 'Allocated',
    capacity: 20,
    currentLoad: 15,
    location: { lat: 40.7128, lon: -74.0060 }, // At fire location
    allocatedToIncidentId: '1',
    managerId: 'admin-2',
    lastUpdated: new Date()
  },
  {
    id: 'r3',
    type: 'Transport',
    name: 'Evacuation Bus 1',
    status: 'Maintenance',
    capacity: 50,
    currentLoad: 0,
    location: { lat: 40.7500, lon: -73.9900 },
    managerId: 'admin-1',
    lastUpdated: new Date()
  }
];

let MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'critical-incident',
    title: 'Fire at Downtown Metro',
    message: 'Structural fire reported at Downtown Metro',
    severity: 'Critical',
    timestamp: new Date(),
    relatedIncidentId: '1',
    acknowledged: false
  },
  {
    id: 'a2',
    type: 'resource-shortage',
    title: 'Need more Ambulance',
    message: 'Need more Ambulance for fire at Downtown Metro atleast 5-10',
    severity: 'Medium',
    timestamp: new Date(Date.now() - 1800000),
    relatedResourceId: 'r2',
    acknowledged: false
  }
];

// --- SERVICES ---

class IncidentService {
  async getAll(): Promise<Incident[]> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network
    return [...MOCK_INCIDENTS];
  }

  async create(data: Omit<Incident, 'id' | 'timestamp' | 'lastUpdated'>): Promise<Incident> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newIncident: Incident = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      lastUpdated: new Date()
    };
    MOCK_INCIDENTS = [newIncident, ...MOCK_INCIDENTS];

    // Trigger System Event
    eventService.emit({
      type: 'incident-created',
      data: newIncident,
      timestamp: new Date()
    });

    // Create Alert
    if (data.severity === 'Critical' || data.severity === 'High') {
      const newAlert: Alert = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'critical-incident',
        title: `New ${data.severity} Incident`,
        message: data.description,
        severity: data.severity,
        timestamp: new Date(),
        relatedIncidentId: newIncident.id,
        acknowledged: false
      };
      MOCK_ALERTS = [newAlert, ...MOCK_ALERTS];
      eventService.emit({ type: 'alert-created', data: newAlert, timestamp: new Date() });
    }

    return newIncident;
  }

  async update(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_INCIDENTS.findIndex(i => i.id === id);
    if (index === -1) return null;

    MOCK_INCIDENTS[index] = { ...MOCK_INCIDENTS[index], ...updates, lastUpdated: new Date() };
    eventService.emit({ type: 'incident-updated', data: MOCK_INCIDENTS[index], timestamp: new Date() });
    return MOCK_INCIDENTS[index];
  }

  async updateStatus(id: string, status: Incident['status'], notes?: string): Promise<Incident | null> {
    return this.update(id, { status, notes });
  }

  async assignTo(id: string, assignedToId: string): Promise<Incident | null> {
    return this.update(id, { assignedToId, status: 'Assigned' });
  }
}

class ResourceService {
  async getAll(): Promise<Resource[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_RESOURCES];
  }

  async update(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_RESOURCES.findIndex(r => r.id === id);
    if (index === -1) return null;

    MOCK_RESOURCES[index] = { ...MOCK_RESOURCES[index], ...updates, lastUpdated: new Date() };
    eventService.emit({ type: 'resource-updated', data: MOCK_RESOURCES[index], timestamp: new Date() });
    return MOCK_RESOURCES[index];
  }

  async allocateToIncident(resourceId: string, incidentId: string): Promise<Resource | null> {
    return this.update(resourceId, {
      status: 'Allocated',
      allocatedToIncidentId: incidentId
    });
  }

  async releaseFromIncident(resourceId: string): Promise<Resource | null> {
    return this.update(resourceId, {
      status: 'Available',
      allocatedToIncidentId: undefined
    });
  }
}

class AlertService {
  async getAll(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...MOCK_ALERTS];
  }

  async acknowledge(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = MOCK_ALERTS.findIndex(a => a.id === id);
    if (index === -1) return false;

    MOCK_ALERTS[index] = { ...MOCK_ALERTS[index], acknowledged: true };
    return true;
  }
}

class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      incidentsByCategory: { 'Medical': 15, 'Fire': 8, 'Flood': 5, 'Supply': 12, 'Other': 10 },
      resourceUtilization: { 'Medical': 0.85, 'Transport': 0.60, 'Volunteers': 0.75, 'Shelter': 0.45, 'Food': 0.30 },
      incidentsOverTime: [
        { date: '2024-03-01', count: 12 }, { date: '2024-03-02', count: 15 },
        { date: '2024-03-03', count: 8 }, { date: '2024-03-04', count: 22 },
        { date: '2024-03-05', count: 18 }, { date: '2024-03-06', count: 25 },
        { date: '2024-03-07', count: 19 },
      ],
      averageResponseTime: 14,
      criticalIncidentCount: MOCK_INCIDENTS.filter(i => i.severity === 'Critical').length,
      activeVolunteers: 142,
      resolvedIncidentCount: 89,
      incidentSeverityDistribution: {
        'Critical': MOCK_INCIDENTS.filter(i => i.severity === 'Critical').length,
        'High': MOCK_INCIDENTS.filter(i => i.severity === 'High').length,
        'Medium': MOCK_INCIDENTS.filter(i => i.severity === 'Medium').length,
        'Low': MOCK_INCIDENTS.filter(i => i.severity === 'Low').length,
      },
      resourceEfficiencyHistory: [
        { date: '2024-03-01', efficiency: 0.65 }, { date: '2024-03-02', efficiency: 0.70 },
        { date: '2024-03-03', efficiency: 0.68 }, { date: '2024-03-04', efficiency: 0.75 },
        { date: '2024-03-05', efficiency: 0.82 }, { date: '2024-03-06', efficiency: 0.78 },
        { date: '2024-03-07', efficiency: 0.85 },
      ],
      incidentClusters: MOCK_INCIDENTS.map(i => ({
        lat: i.location.lat,
        lon: i.location.lon,
        intensity: i.severity === 'Critical' ? 1.0 : i.severity === 'High' ? 0.7 : 0.4
      }))
    };
  }
}

// --- AUTH SERVICE ---
class AuthService {
  private currentUser: User | null = null;

  getCurrentUser(): User | null {
    // Check local storage for session persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crisis_user');
      if (stored) return JSON.parse(stored);
    }
    return this.currentUser;
  }

  async login(email: string, role: UserRole = 'Citizen'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Network delay simulation

    // Create mock user
    const user: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name: role === 'AgencyAdmin' ? 'Admin Officer' : role === 'Volunteer' ? 'Field Volunteer' : 'John Doe',
      email,
      role,
      createdAt: new Date()
    };

    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('crisis_user', JSON.stringify(user));
    }
    return user;
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crisis_user');
    }
  }

  switchUserRole(role: UserRole): User | null {
    if (this.currentUser) {
      const updatedUser = { ...this.currentUser, role };
      this.currentUser = updatedUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('crisis_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    }
    return null;
  }
}

// EXPORTS
export const incidentService = new IncidentService();
export const resourceService = new ResourceService();
export const alertService = new AlertService();
export const analyticsService = new AnalyticsService();
export const authService = new AuthService();