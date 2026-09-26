// Mobile API client for INSPECTRA Flask backend
const BASE_URL = 'http://10.0.2.2:5000'; // Default Android emulator host loopback or localhost

let authToken: string | null = null;

export const setMobileAuthToken = (token: string | null) => {
  authToken = token;
};

async function mobileRequest<T>(endpoint: string, options: any = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.error?.message || `HTTP ${response.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const mobileApi = {
  login: async (email: string, password: string) => {
    const res = await mobileRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setMobileAuthToken(res.token);
    return res;
  },

  getAssignedInspections: () =>
    mobileRequest<{ inspections: any[]; total: number }>('/api/inspections'),

  getInspectionDetail: (id: number) =>
    mobileRequest<any>(`/api/inspections/${id}`),

  startInspection: (id: number) =>
    mobileRequest<any>(`/api/inspections/${id}/start`, { method: 'POST' }),

  verifyGPS: (id: number, coords: { latitude: number; longitude: number }) =>
    mobileRequest<any>(`/api/inspections/${id}/gps`, {
      method: 'POST',
      body: JSON.stringify(coords),
    }),

  updateChecklist: (id: number, items: Array<{ id: number; status?: string; notes?: string }>) =>
    mobileRequest<any>(`/api/inspections/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  uploadEvidence: (id: number, payload: { category: string; description: string; latitude: number; longitude: number; file_url?: string }) =>
    mobileRequest<any>(`/api/inspections/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitReport: (id: number, payload: any) =>
    mobileRequest<any>(`/api/inspections/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getNotifications: () =>
    mobileRequest<{ notifications: any[]; unread_count: number }>('/api/notifications'),
};
