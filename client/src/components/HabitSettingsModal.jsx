import PropTypes from 'prop-types';
import { X, RefreshCw, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { habitService } from '../services/habitService';

export default function HabitSettingsModal({ show, onClose, onResetComplete }) {
  if (!show) return null;

  const handleHardReset = async () => {
    if (window.confirm('¿ESTÁS SEGURO? Esta acción eliminará TODO el historial de todos tus hábitos permanentemente. No se puede deshacer.')) {
      try {
        await habitService.hardReset();
        toast.success('Todos los hábitos han sido reiniciados');
        if (onResetComplete) onResetComplete();
        onClose();
      } catch (err) {
        console.error(err);
        toast.error('Error al realizar el reinicio total');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><Settings size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Ajustes de Hábitos</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <section className="settings-section">
          <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Zona de Peligro
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Hard Reset</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reinicia todos tus hábitos a cero (borra todo el historial de completaciones de todos los hábitos)</p>
            </div>
            <button 
              onClick={handleHardReset} 
              className="btn-primary" 
              style={{ background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem 1.2rem', width: '100%' }}
            >
              <RefreshCw size={18} />
              Reiniciar Todo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

HabitSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onResetComplete: PropTypes.func
};
