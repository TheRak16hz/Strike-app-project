const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getSeedData = async (token) => {
  const res = await fetch(`${API_URL}/api/seed`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener datos');
  return res.json();
};

export const logSeedEvent = async (token, status, date) => {
  const res = await fetch(`${API_URL}/api/seed/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status, log_date: date })
  });
  if (!res.ok) throw new Error('Error al registrar evento');
  return res.json();
};

export const deleteAllSeedData = async (token) => {
  const res = await fetch(`${API_URL}/api/seed/all`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al eliminar datos');
  return res.json();
};
