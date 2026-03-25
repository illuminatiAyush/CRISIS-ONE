/**
 * Core domain types for the Crisis Response Platform
 * Provides type safety across all application layers
 */

export type UserRole = 'Citizen' | 'Volunteer' | 'AgencyAdmin';

export type IncidentCategory = 'Fire' | 'Flood' | 'Medical' | 'Supply' | 'Other';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Pending' | 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';

export type ResourceType = 'Medical' | 'Food' | 'Shelter' | 'Transport' | 'Volunteers';
export type ResourceStatus = 'Available' | 'Allocated' | 'Critical' | 'Maintenance';

export interface Location {
  lat: number;
  lon: number;
  address?: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Location; // Maps to lat/lng in DB
  description: string;
  reporterId: string; // Maps to user_id in DB
  assignedToId?: string;
  agencies_assigned?: string[]; // Maps to agencies_assigned in DB
  notes?: string;
  timestamp: Date; // Maps to created_at in DB
  lastUpdated: Date;
  estimatedAffected?: number; // Maps to estimated_people_affected in DB
  img_url?: string; // Maps to img_url in DB
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  status: ResourceStatus;
  capacity: number;
  currentLoad: number;
  location: Location;
  allocatedToIncidentId?: string;
  managerId: string;
  lastUpdated: Date;
  contactInfo?: string;
}

export interface Alert {
  id: string;
  type: 'critical-incident' | 'resource-shortage' | 'system' | 'weather';
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: Date;
  relatedIncidentId?: string;
  relatedResourceId?: string;
  acknowledged: boolean;
}

export interface AnalyticsData {
  averageResponseTime: number;
  incidentsByCategory: Record<IncidentCategory, number>;
  resourceUtilization: Record<ResourceType, number>;
  incidentsOverTime: Array<{ date: string; count: number; }>;
  criticalIncidentCount: number;
  activeVolunteers: number;
  resolvedIncidentCount: number;
  // New metrics
  incidentSeverityDistribution: Record<IncidentSeverity, number>;
  resourceEfficiencyHistory: Array<{ date: string; efficiency: number }>;
  incidentClusters: Array<{ lat: number; lon: number; intensity: number }>;
}

// Event types for real-time updates
export interface SystemEvent {
  type: 'incident-created' | 'incident-updated' | 'resource-updated' | 'alert-created';
  data: Incident | Resource | Alert;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Map-related types
export interface MapMarker {
  id: string;
  type: 'incident' | 'resource';
  position: [number, number];
  popup: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus | ResourceStatus;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  markers: MapMarker[];
}

// Filter types for UI
export interface IncidentFilters {
  categories: IncidentCategory[];
  severities: IncidentSeverity[];
  statuses: IncidentStatus[];
  dateRange?: { start: Date; end: Date; };
  location?: { center: Location; radius: number; };
  reporterId?: string;
  onlyMyIncidents?: boolean;
}

export interface ResourceFilters {
  types: ResourceType[];
  statuses: ResourceStatus[];
  availability?: 'available' | 'allocated' | 'all';
}