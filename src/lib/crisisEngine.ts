/**
 * CrisisOne Crisis Intelligence Engine
 * ---
 * Frontend-based logic for:
 * - Priority scoring
 * - Smart agency assignment (nearest by distance)
 * - Geo-targeted alerts (radius filtering)
 * - Decision support (cluster detection, risk analysis)
 */

// ========================
// TYPES
// ========================

export interface Incident {
  id: string;
  title: string;
  category: string;
  severity: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  priority_score: number;
  status: string;
  assigned_agency_id: string | null;
  alert_radius: number;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  contact: string | null;
  capacity: number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  agency_id: string | null;
  quantity: number;
  lat: number | null;
  lng: number | null;
}

export interface DecisionInsight {
  type: "danger" | "warning" | "info";
  icon: string;
  title: string;
  message: string;
}

// ========================
// 1. PRIORITY SCORING
// ========================

const SEVERITY_WEIGHT: Record<string, number> = {
  Critical: 100,
  High: 75,
  Medium: 50,
  Low: 25,
};

/**
 * Compute a priority score based on severity + how recent the incident is.
 * Higher = more urgent. Max ~100.
 */
export function computePriorityScore(
  severity: string,
  createdAt: string
): number {
  const base = SEVERITY_WEIGHT[severity] || 25;

  // Time decay: incidents lose urgency over time
  const ageMinutes =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);

  // Recency boost: newer = higher score. Decay over 24h.
  const recencyBoost = Math.max(0, 30 - (ageMinutes / 1440) * 30);

  return Math.round(Math.min(100, base + recencyBoost));
}

/**
 * Sort incidents by priority (highest first)
 */
export function sortByPriority(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const scoreA = computePriorityScore(a.severity, a.created_at);
    const scoreB = computePriorityScore(b.severity, b.created_at);
    return scoreB - scoreA;
  });
}

// ========================
// 2. GEO UTILITIES
// ========================

/**
 * Haversine distance in km between two lat/lng points
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ========================
// 3. SMART ASSIGNMENT
// ========================

/**
 * Find the nearest agency to an incident.
 * Returns agency or null if no agency is within 50km.
 */
export function findNearestAgency(
  incident: Incident,
  agencies: Agency[]
): Agency | null {
  if (!incident.lat || !incident.lng || agencies.length === 0) return null;

  let nearest: Agency | null = null;
  let minDist = Infinity;

  for (const agency of agencies) {
    const dist = haversineDistance(
      incident.lat,
      incident.lng,
      agency.lat,
      agency.lng
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = agency;
    }
  }

  return minDist <= 50 ? nearest : null;
}

/**
 * Smart assign: match agencies by incident category
 */
export function findBestAgency(
  incident: Incident,
  agencies: Agency[]
): Agency | null {
  if (!incident.lat || !incident.lng) return null;

  // Category → preferred agency type mapping
  const typeMap: Record<string, string[]> = {
    Fire: ["Fire"],
    Flood: ["Rescue", "Maritime"],
    Earthquake: ["Rescue", "Government"],
    Medical: ["Medical"],
    "Road Accident": ["Police", "Medical"],
    "Building Collapse": ["Rescue", "Fire"],
    "Gas Leak": ["Fire", "Rescue"],
    Other: ["Government"],
  };

  const preferred = typeMap[incident.category] || ["Government"];

  // Filter agencies that match preferred types
  const matched = agencies.filter((a) => preferred.includes(a.type));

  // If we have matching types, pick nearest of those. Otherwise pick nearest overall.
  const pool = matched.length > 0 ? matched : agencies;

  return findNearestAgency({ ...incident }, pool);
}

// ========================
// 4. GEO-TARGETED ALERTS
// ========================

/**
 * Filter incidents within a radius (km) of a given location.
 */
export function getIncidentsNearby(
  incidents: Incident[],
  userLat: number,
  userLng: number,
  radiusKm: number = 10
): Incident[] {
  return incidents.filter((inc) => {
    if (!inc.lat || !inc.lng) return false;
    return haversineDistance(userLat, userLng, inc.lat, inc.lng) <= radiusKm;
  });
}

/**
 * Check if a user is within an incident's alert radius
 */
export function isInAlertZone(
  incident: Incident,
  userLat: number,
  userLng: number
): boolean {
  if (!incident.lat || !incident.lng) return false;
  const dist = haversineDistance(userLat, userLng, incident.lat, incident.lng);
  return dist <= (incident.alert_radius || 5);
}

// ========================
// 5. DECISION SUPPORT
// ========================

/**
 * Detect clusters of incidents in the same area.
 * A cluster = 3+ incidents within 2km of each other.
 */
export function detectClusters(
  incidents: Incident[],
  radiusKm: number = 2,
  minCount: number = 3
): { center: { lat: number; lng: number }; count: number; incidents: Incident[] }[] {
  const geoIncidents = incidents.filter((i) => i.lat && i.lng);
  const visited = new Set<string>();
  const clusters: { center: { lat: number; lng: number }; count: number; incidents: Incident[] }[] = [];

  for (const inc of geoIncidents) {
    if (visited.has(inc.id)) continue;

    const nearby = geoIncidents.filter(
      (other) =>
        other.id !== inc.id &&
        haversineDistance(inc.lat!, inc.lng!, other.lat!, other.lng!) <= radiusKm
    );

    if (nearby.length + 1 >= minCount) {
      const allInCluster = [inc, ...nearby];
      allInCluster.forEach((i) => visited.add(i.id));

      // Compute centroid
      const centerLat =
        allInCluster.reduce((s, i) => s + i.lat!, 0) / allInCluster.length;
      const centerLng =
        allInCluster.reduce((s, i) => s + i.lng!, 0) / allInCluster.length;

      clusters.push({
        center: { lat: centerLat, lng: centerLng },
        count: allInCluster.length,
        incidents: allInCluster,
      });
    }
  }

  return clusters;
}

/**
 * Generate decision insights from current incident data
 */
export function generateInsights(
  incidents: Incident[],
  agencies: Agency[]
): DecisionInsight[] {
  const insights: DecisionInsight[] = [];
  const active = incidents.filter((i) => i.status !== "resolved");
  const critical = active.filter((i) => i.severity === "Critical");

  // Cluster detection
  const clusters = detectClusters(active);
  if (clusters.length > 0) {
    insights.push({
      type: "danger",
      icon: "mdi:alert-octagon",
      title: "Incident Cluster Detected",
      message: `${clusters.length} high-density zone(s) found — ${clusters.reduce((s, c) => s + c.count, 0)} incidents concentrated in small areas. Consider deploying additional units.`,
    });
  }

  // Critical surge
  if (critical.length >= 3) {
    insights.push({
      type: "danger",
      icon: "mdi:fire-alert",
      title: "Critical Surge Alert",
      message: `${critical.length} critical incidents active simultaneously. This exceeds normal thresholds — escalation recommended.`,
    });
  }

  // Unassigned incidents
  const unassigned = active.filter((i) => !i.assigned_agency_id);
  if (unassigned.length > 0) {
    insights.push({
      type: "warning",
      icon: "mdi:account-question",
      title: `${unassigned.length} Unassigned Incident(s)`,
      message: `These incidents are awaiting agency assignment. Use auto-assign to dispatch the nearest available team.`,
    });
  }

  // Agency capacity
  const activeAssigned = active.filter((i) => i.assigned_agency_id);
  const overloaded = agencies.filter((a) => {
    const load = activeAssigned.filter(
      (i) => i.assigned_agency_id === a.id
    ).length;
    return load >= a.capacity * 0.8;
  });
  if (overloaded.length > 0) {
    insights.push({
      type: "warning",
      icon: "mdi:domain-off",
      title: "Agency Capacity Warning",
      message: `${overloaded.map((a) => a.name).join(", ")} approaching max capacity. Consider redistributing assignments.`,
    });
  }

  // Time-based pattern
  const lastHour = active.filter(
    (i) => Date.now() - new Date(i.created_at).getTime() < 60 * 60 * 1000
  );
  if (lastHour.length >= 5) {
    insights.push({
      type: "info",
      icon: "mdi:chart-line",
      title: "Spike Detected",
      message: `${lastHour.length} incidents reported in the last hour — above average activity. Monitor closely.`,
    });
  }

  // All calm
  if (active.length === 0) {
    insights.push({
      type: "info",
      icon: "mdi:shield-check",
      title: "All Clear",
      message: "No active incidents. All systems operational.",
    });
  }

  return insights;
}

// ========================
// 6. RESOURCE HELPERS
// ========================

export function getResourceStats(resources: Resource[]) {
  const total = resources.reduce((s, r) => s + r.quantity, 0);
  const available = resources
    .filter((r) => r.status === "available")
    .reduce((s, r) => s + r.quantity, 0);
  const deployed = resources
    .filter((r) => r.status === "deployed")
    .reduce((s, r) => s + r.quantity, 0);
  const maintenance = resources
    .filter((r) => r.status === "maintenance")
    .reduce((s, r) => s + r.quantity, 0);

  return { total, available, deployed, maintenance };
}
