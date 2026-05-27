const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('strike_token')}`
});

export const nutritionService = {
  // Daily data
  getDailyData: async () => {
    const res = await fetch(`${API}/api/nutrition`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener datos nutricionales');
    return res.json();
  },

  // Library
  getLibrary: async () => {
    const res = await fetch(`${API}/api/nutrition/library`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener librería');
    return res.json();
  },
  createFood: async (data) => {
    const res = await fetch(`${API}/api/nutrition/library`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al crear alimento');
    return res.json();
  },
  deleteFood: async (id) => {
    const res = await fetch(`${API}/api/nutrition/library/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar alimento');
    return res.json();
  },

  deleteAllNutritionLogs: async () => {
    const res = await fetch(`${API}/api/nutrition/all`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar todos los registros');
    return res.json();
  },

  // Food logs
  logFood: async (data) => {
    const res = await fetch(`${API}/api/nutrition/food`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al registrar alimento');
    return res.json();
  },
  deleteLogFood: async (id) => {
    const res = await fetch(`${API}/api/nutrition/food/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar registro');
    return res.json();
  },

  // Water
  logWater: async (data) => {
    const res = await fetch(`${API}/api/nutrition/water`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al registrar agua');
    return res.json();
  },
  deleteWater: async (id) => {
    const res = await fetch(`${API}/api/nutrition/water/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar registro de agua');
    return res.json();
  },

  // Caffeine
  logCaffeine: async (data) => {
    const res = await fetch(`${API}/api/nutrition/caffeine`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al registrar cafeína');
    return res.json();
  },
  deleteCaffeine: async (id) => {
    const res = await fetch(`${API}/api/nutrition/caffeine/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('Error al eliminar registro');
    return res.json();
  },

  // Settings
  saveSettings: async (data) => {
    const res = await fetch(`${API}/api/nutrition/settings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al guardar configuración');
    return res.json();
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API}/api/nutrition/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
  },
  saveProfile: async (data) => {
    const res = await fetch(`${API}/api/nutrition/profile`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Error al guardar perfil');
    return res.json();
  },

  // BMI
  getBmi: async () => {
    const res = await fetch(`${API}/api/nutrition/bmi`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al calcular IMC');
    return res.json();
  }
};
