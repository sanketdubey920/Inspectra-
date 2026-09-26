const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

function getAuthToken(): string | null {
  return localStorage.getItem('inspectra_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = json?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return json.data !== undefined ? json.data : json;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: {
      name: string;
      email: string;
      password: string;
      role: string;
      phone?: string;
      designation?: string;
      department?: string;
      institute_id?: number;
    }) =>
      request<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: any }>('/api/auth/me'),
    logout: () =>
      request('/api/auth/logout', { method: 'POST' }),
    sendBeneficiaryOTP: (data: { name: string; phone: string; email: string }) =>
      request<{ sent_to_phone: string; sent_to_email: string; otp_demo: string; expires_in_seconds: number; message: string }>(
        '/api/auth/beneficiary-otp/send',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    verifyBeneficiaryOTP: (data: { name: string; phone: string; email: string; otp: string }) =>
      request<{ token: string; user: any }>('/api/auth/beneficiary-otp/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  institutes: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ institutes: any[]; total: number }>(`/api/institutes${qs}`);
    },
    getById: (id: number) => request<any>(`/api/institutes/${id}`),
    getRisk: (id: number) => request<any>(`/api/institutes/${id}/risk`),
    getCCTV: (id: number) => request<any>(`/api/institutes/${id}/cctv`),
  },

  inspections: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ inspections: any[]; total: number }>(`/api/inspections${qs}`);
    },
    getById: (id: number) => request<any>(`/api/inspections/${id}`),
    assign: (data: {
      institute_id: number;
      inspector_id: number;
      inspection_type?: string;
      priority?: string;
      special_instructions?: string;
    }) =>
      request<any>('/api/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    start: (id: number) =>
      request<any>(`/api/inspections/${id}/start`, { method: 'POST' }),
    verifyGPS: (id: number, coords: { latitude: number; longitude: number }) =>
      request<any>(`/api/inspections/${id}/gps`, {
        method: 'POST',
        body: JSON.stringify(coords),
      }),
    updateChecklist: (id: number, items: Array<{ id: number; status?: string; notes?: string }>) =>
      request<any>(`/api/inspections/${id}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
    uploadEvidence: (id: number, formData: FormData) =>
      request<any>(`/api/inspections/${id}/evidence`, {
        method: 'POST',
        body: formData,
      }),
    submitReport: (id: number, data: any) =>
      request<any>(`/api/inspections/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    review: (id: number, data: { final_status: string; remarks: string }) =>
      request<any>(`/api/inspections/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  correctiveActions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ corrective_actions: any[]; total: number }>(`/api/corrective-actions${qs}`);
    },
    getById: (id: number) => request<any>(`/api/corrective-actions/${id}`),
    create: (data: {
      institute_id: number;
      inspection_id?: number;
      issue_title: string;
      description: string;
      severity?: string;
      deadline_days?: number;
    }) =>
      request<any>('/api/corrective-actions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    submitResolution: (id: number, data: { resolution_description: string; resolution_evidence_url?: string }) =>
      request<any>(`/api/corrective-actions/${id}/submit-resolution`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    verify: (id: number, data: { decision: string; remarks: string }) =>
      request<any>(`/api/corrective-actions/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  risk: {
    getSummary: () => request<any>('/api/risk/summary'),
    getAnomalies: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ anomalies: any[]; total: number }>(`/api/risk/anomalies${qs}`);
    },
    recalculate: (instituteId: number) =>
      request<any>(`/api/risk/recalculate/${instituteId}`, { method: 'POST' }),
  },

  cctv: {
    getSnapshotUrl: (cameraId: number) => `${API_BASE_URL}/api/cctv/${cameraId}/snapshot`,
    getStreamUrl: (cameraId: number) => `${API_BASE_URL}/api/cctv/${cameraId}/stream`,
    getInstituteCameras: (instituteId: number) =>
      request<{ institute_id: number; institute_name: string; cameras: any[] }>(
        `/api/cctv/institutes/${instituteId}`
      ),
  },

  alerts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ alerts: any[]; total: number; critical_count: number; high_count: number; medium_count: number }>(
        `/api/alerts${qs}`
      );
    },
  },

  reports: {
    getSummary: () => request<{ data: any[]; total: number }>('/api/reports'),
    getExportCsvUrl: () => `${API_BASE_URL}/api/reports/export-csv`,
  },

  feedback: {
    submit: (data: {
      institute_id: number;
      category: string;
      description: string;
      severity?: string;
      is_anonymous?: boolean;
      name?: string;
      contact?: string;
    }) =>
      request<{ tracking_code: string; complaint: any }>('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    track: (trackingCode: string) => request<any>(`/api/feedback/track/${trackingCode}`),
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ feedback: any[]; total: number }>(`/api/feedback${qs}`);
    },
    updateAction: (id: number, data: { status?: string; resolution_notes?: string; severity?: string }) =>
      request<any>(`/api/feedback/${id}/action`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: () =>
      request<{ notifications: any[]; unread_count: number; total: number }>('/api/notifications'),
    create: (data: { title: string; message: string; notification_type?: string; link?: string }) =>
      request<any>('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    markRead: (id: number) =>
      request<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () =>
      request<any>('/api/notifications/read-all', { method: 'PUT' }),
  },

  audit: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ audit_logs: any[]; total: number }>(`/api/audit-logs${qs}`);
    },
  },
};
