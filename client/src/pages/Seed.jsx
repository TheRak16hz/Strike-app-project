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

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Seed() {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ logs: [], current_streak: 0 });
  const [quote, setQuote] = useState('');

  const [selectedDateToEdit, setSelectedDateToEdit] = useState(null);

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

  const handleLog = async (status, logDate = null) => {
    try {
      await logSeedEvent(token, status, logDate);
      toast.success(status === 'clean' ? '¡Día limpio registrado!' : 'Registro actualizado');
      loadData();
      setSelectedDateToEdit(null);
    } catch (err) {
      toast.error('Error al registrar');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('🚨 ¡PELIGRO! 🚨\n\n¿Estás seguro de que deseas eliminar TODOS los registros de Seed?\n\nEsta acción NO se puede deshacer y perderás todo tu progreso y rachas.')) return;
    
    try {
      setLoading(true);
      const { deleteAllSeedLogs } = await import('../services/seedService');
      await deleteAllSeedLogs(token);
      toast.success('Todos los registros han sido eliminados');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar los registros');
      setLoading(false);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDateToEdit(day);
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

      <WeeklyTracker logs={data.logs} onDayClick={handleDayClick} />
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
        (Haz clic en cualquier día anterior para editar su estado)
      </p>

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

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Zona de Peligro
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Elimina permanentemente todo tu historial y progreso de este módulo.
        </p>
        <button 
          onClick={handleDeleteAll}
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          Borrar todos los registros
        </button>
      </div>

      {selectedDateToEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-panel animate-scale" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Editar {selectedDateToEdit.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              ¿Qué ocurrió exactamente ese día? Modificar este registro podría recalcular tu racha actual.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn-primary" 
                style={{ background: 'var(--brand-green)' }}
                onClick={() => {
                  handleLog('clean', toLocalDateString(selectedDateToEdit));
                }}
              >
                Mantuve el control ✅
              </button>
              <button 
                className="btn-primary" 
                style={{ background: 'var(--danger)' }}
                onClick={() => {
                  handleLog('relapse', toLocalDateString(selectedDateToEdit));
                }}
              >
                Tuve un fallo ❌
              </button>
              <button 
                style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedDateToEdit(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
