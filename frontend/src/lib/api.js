// All external API calls go through the backend proxy at /api
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export function getBtcPrice() {
  return request('/prices/btc')
}

export function getBrlRate() {
  return request('/prices/brl')
}

export function getBtcBalance(address) {
  return request(`/balance/${address}`)
}

export function getMarketMoment() {
  return request('/market/moment')
}

export function getAporteConfig() {
  return request('/market/config')
}

export function getUserSettings(token) {
  return request('/settings', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function updateUserSettings(token, data) {
  return request('/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
}

export function updateMarketMoment(token, status) {
  return request('/admin/moment', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
}

export function updateAporteConfig(token, configs) {
  return request('/admin/config', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ configs }),
  })
}
