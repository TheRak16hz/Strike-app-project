import PropTypes from 'prop-types';
import { X, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainingService } from '../../../services/trainingService';

export default function TrainingSettingsModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale" style={{ maxWidth: '400px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><Settings size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Ajustes de Gym</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Zona de Peligro
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Hard Reset de Gimnasio</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Elimina todas las rutinas y el historial de entrenamiento permanentemente.</p>
            </div>
            <button 
              type="button"
              onClick={async () => {
                if (window.confirm('¿ESTÁS SEGURO? Se borrará todo tu progreso de entrenamiento y ejercicios creados.')) {
                   try {
                     await trainingService.deleteAllData();
                     toast.success('Todos los datos eliminados');
                     window.location.reload();
                   } catch (err) {
                     toast.error('Error al reiniciar los datos');
                   }
                }
              }} 
              className="btn-primary" 
              style={{ background: 'var(--danger)', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={18} /> Borrar Todo el Progreso
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

TrainingSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
