export const BASE_URL = import.meta.env.VITE_CRISPY_API_BASE_URL

if (!BASE_URL) {
  throw new Error('Missing VITE_CRISPY_API_BASE_URL')
}

let _csrfToken: string | null = null

export function setCsrfToken(token: string | null) {
  _csrfToken = token
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  }
  const method = (init?.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && _csrfToken) {
    headers['X-Portal-CSRF'] = _csrfToken
  }
  if (init?.body && typeof init.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

function responseData<T>(envelope: { data?: T; success?: boolean } & Record<string, unknown>): T {
  if (envelope.data) return envelope.data as T
  return envelope as T
}

export const api = {
  me: {
    get: () =>
      request<{ data: { user: { id: string; email: string }; accountSettings: Record<string, unknown>; profiles: unknown[] } }>('/v1/portal/me')
        .then(responseData),
  },

  account: {
    getSettings: () =>
      request<{ data: { settings: Record<string, unknown> } }>('/v1/portal/account/settings').then(responseData),
    patchSettings: (patch: Record<string, unknown>) =>
      request<{ data: { settings: Record<string, unknown> } }>('/v1/portal/account/settings', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }).then(responseData),
    delete: () =>
      request<{ data: { deleted: boolean } }>('/v1/portal/account', { method: 'DELETE' }).then(responseData),
  },

  secrets: {
    ai: {
      get: () =>
        request<{ data: { secret: { key: string; present: boolean; fingerprint: string } } }>('/v1/portal/account/secrets/ai-api-key')
          .then(responseData),
      put: (value: string) =>
        request<{ data: { secret: { key: string; present: boolean; fingerprint: string } } }>('/v1/portal/account/secrets/ai-api-key', {
          method: 'PUT',
          body: JSON.stringify({ value }),
        }).then(responseData),
      delete: () =>
        request<{ data: { deleted: boolean } }>('/v1/portal/account/secrets/ai-api-key', { method: 'DELETE' }).then(responseData),
    },
    mdblist: {
      get: () =>
        request<{ data: { secret: { key: string; present: boolean; fingerprint: string } } }>('/v1/portal/account/secrets/mdblist-api-key')
          .then(responseData),
      put: (value: string) =>
        request<{ data: { secret: { key: string; present: boolean; fingerprint: string } } }>('/v1/portal/account/secrets/mdblist-api-key', {
          method: 'PUT',
          body: JSON.stringify({ value }),
        }).then(responseData),
      delete: () =>
        request<{ data: { deleted: boolean } }>('/v1/portal/account/secrets/mdblist-api-key', { method: 'DELETE' }).then(responseData),
    },
  },

  profiles: {
    list: () =>
      request<{ data: { profiles: unknown[] } }>('/v1/portal/profiles').then(responseData),
    create: (body: Record<string, unknown>) =>
      request<{ data: { profile: unknown } }>('/v1/portal/profiles', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then(responseData),
    update: (profileId: string, body: Record<string, unknown>) =>
      request<{ data: { profile: unknown } }>(`/v1/portal/profiles/${profileId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }).then(responseData),
    getSettings: (profileId: string) =>
      request<{ data: { settings: Record<string, unknown> } }>(`/v1/portal/profiles/${profileId}/settings`).then(responseData),
    patchSettings: (profileId: string, patch: Record<string, unknown>) =>
      request<{ data: { settings: Record<string, unknown> } }>(`/v1/portal/profiles/${profileId}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }).then(responseData),
  },

  providerImports: {
    listConnections: (profileId: string) =>
      request<{ data: { providerStates: unknown[]; watchDataState: unknown } }>(`/v1/portal/profiles/${profileId}/import-connections`)
        .then(responseData),
    startImport: (profileId: string, provider: string, action: string) =>
      request<{ data: { authUrl: string | null; nextAction: string; providerState: unknown; job: unknown | null } }>(
        `/v1/portal/profiles/${profileId}/imports/start`,
        { method: 'POST', body: JSON.stringify({ provider, action }) },
      ).then(responseData),
    listJobs: (profileId: string) =>
      request<{ data: { jobs: unknown[] } }>(`/v1/portal/profiles/${profileId}/imports`).then(responseData),
    getJob: (profileId: string, jobId: string) =>
      request<{ data: { job: unknown } }>(`/v1/portal/profiles/${profileId}/imports/${jobId}`).then(responseData),
    disconnect: (profileId: string, provider: string) =>
      request<{ data: { providerState: unknown } }>(`/v1/portal/profiles/${profileId}/import-connections/${provider}`, {
        method: 'DELETE',
      }).then(responseData),
  },

  portalHandoff: {
    exchange: (code: string) =>
      request<{ data: { accessToken: string; refreshToken: string } }>(
        '/v1/auth/portal-handoff/exchange',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        },
      ).then(responseData),
  },

  pat: {
    list: () =>
      request<{ data: { items: unknown[] } }>('/v1/portal/api-keys').then(responseData),
    create: (body: { name: string; scopes?: string[]; expiresAt?: string | null }) =>
      request<{ data: { token: { plaintext?: string; id: string; name: string } } }>('/v1/portal/api-keys', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then(responseData),
    revoke: (tokenId: string) =>
      request<{ data: { token: unknown } }>(`/v1/portal/api-keys/${tokenId}`, { method: 'DELETE' }).then(responseData),
  },
}
