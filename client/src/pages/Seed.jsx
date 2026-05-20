import { useState, useEffect, useContext } from 'react';
import { Leaf, RefreshCcw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { getSeedData, logSeedEvent } from '../services/seedService';
import SeedTree from '../components/seed/SeedTree';
import WeeklyTracker from '../components/seed/WeeklyTracker';

const QUOTES = [
  "La disciplina es el puente entre las metas y los logros.",
  "No cuentes los días, haz que los días cuenten.",
  "La verdadera libertad requiere el dominio de uno mismo.",
  "El crecimiento empieza donde termina la zona de confort.",
  "El dominio de la mente es el principio de la fuerza."
];

export default function Seed() {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ logs: [], current_streak: 0 });
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (user && user.username === 'TheRak16hz') {
      loadData();
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    } else {
      setLoading(false); // They will just see an access denied message
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getSeedData(token);
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (status) => {
    try {
      await logSeedEvent(token, status);
      toast.success(status === 'clean' ? '¡Día limpio registrado!' : 'Registro actualizado');
      loadData();
    } catch (err) {
      toast.error('Error al registrar');
    }
  };

  if (!user || user.username !== 'TheRak16hz') {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
        <div>
          <h2>Módulo Restringido</h2>
          <p style={{ color: 'var(--text-secondary)' }}>No tienes acceso a esta área.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Cargando...</h2></div>;
  }

  const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
          <Leaf size={24} color="#10b981" />
          Seed Tracker
        </h2>
        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>{date} — Progreso Personal</p>
      </div>

      <WeeklyTracker logs={data.logs} />

      <SeedTree streak={data.current_streak} />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={() => handleLog('clean')}
          className="hover-scale"
          style={{
            flex: 1,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            color: '#10b981',
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <CheckCircle size={20} />
          Mantenerse Fuerte
        </button>
        <button 
          onClick={() => {
            if(window.confirm('¿Estás seguro de registrar una recaída? Esto reiniciará tu racha.')) {
              handleLog('relapse');
            }
          }}
          className="hover-scale"
          style={{
            flex: 1,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RefreshCcw size={20} />
          Registrar Fallo
        </button>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        textAlign: 'center',
        fontStyle: 'italic',
        color: 'var(--text-secondary)'
      }}>
        "{quote}"
      </div>
    </div>
  );
}
