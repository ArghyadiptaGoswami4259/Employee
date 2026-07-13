/**
 * MongoDB API client — proxies all requests through the Edge Function.
 * The Edge Function connects to MongoDB Atlas via Mongoose using MONGODB_URI.
 */

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employees`;

const authHeaders = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export class MongoDBConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MongoDBConnectionError';
  }
}

async function request(method, path = '', body = null) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: authHeaders,
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (res.status === 503) throw new MongoDBConnectionError(data.error);
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const employeeApi = {
  list: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
    ).toString();
    return request('GET', qs ? `?${qs}` : '');
  },
  create: (data) => request('POST', '', data),
  update: (id, data)  => request('PUT',    `/${id}`, data),
  remove: (id)        => request('DELETE', `/${id}`),
};
