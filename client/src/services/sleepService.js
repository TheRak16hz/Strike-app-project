const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('strike_token')}`
});

export const sleepService = {
  getSleepData: async () => {
    const res = await fetch(`${API}/api/sleep`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener datos de sueño');
    return res.json();
  },

  logSleep: async (data) => {
    const res = await fetch(`${API}/api/sleep/log`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al registrar sueño');
    return res.json();
  },

  updateSleepLog: async (id, data) => {
    const res = await fetch(`${API}/api/sleep/log/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al actualizar registro');
    return res.json();
  },

  deleteSleepLog: async (id) => {
    const res = await fetch(`${API}/api/sleep/log/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar registro');
    return res.json();
  },

  saveSettings: async (data) => {
    const res = await fetch(`${API}/api/sleep/settings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al guardar configuración');
    return res.json();
  },

  deleteAllData: async () => {
    const res = await fetch(`${API}/api/sleep/all`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar datos');
    return res.json();
  }
};
