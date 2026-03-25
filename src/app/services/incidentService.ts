import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from "@/app/types";
import axios from "axios";

// Helper to map API result to app Incident type (handling dates)
const mapApiToIncident = (data: any): Incident => ({
    ...data,
    timestamp: new Date(data.timestamp),
    lastUpdated: new Date(data.lastUpdated),
});

export const incidentService = {
    async create(incidentData: Omit<Incident, 'id' | 'timestamp' | 'lastUpdated' | 'img_url' | 'agencies_assigned'>, imageFile?: File): Promise<Incident | null> {
        const formData = new FormData();
        formData.append('category', incidentData.category);
        formData.append('severity', incidentData.severity);
        formData.append('description', incidentData.description);
        formData.append('lat', incidentData.location.lat.toString());
        formData.append('lng', incidentData.location.lon.toString());
        formData.append('reporterId', incidentData.reporterId);

        if (incidentData.estimatedAffected) {
            formData.append('estimatedAffected', incidentData.estimatedAffected.toString());
        }

        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await axios.post('/api/incidents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return mapApiToIncident(response.data.data);
        }
        throw new Error(response.data.error || 'Failed to create incident');
    },

    async getAll(): Promise<Incident[]> {
        const response = await axios.get('/api/incidents');
        if (response.data.success) {
            return response.data.data.map(mapApiToIncident);
        }
        throw new Error(response.data.error || 'Failed to fetch incidents');
    },

    async updateStatus(id: string, status: string): Promise<void> {
        const response = await axios.patch(`/api/incidents/${id}`, { status });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to update status');
        }
    }
};
