import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sleepService } from '../../../services/sleepService';

export default function SleepSettingsModal({ show, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState({
    target_hours: 8,
    bedtime_goal: '23:00',
    wakeup_goal: '07:00'
  });

  useEffect(() => {
    if (show && settings) {
      setLocalSettings({
        target_hours: settings.target_hours || 8,
        bedtime_goal: settings.bedtime_goal || '23:00',
        wakeup_goal: settings.wakeup_goal || '07:00'
      });
    }
  }, [show, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(localSettings);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-content animate-scale">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}><Settings size={20} color="#8b5cf6" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Ajustes de Sueño</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label>Meta de Horas de Sueño</label>
            <input 
              type="number" 
              step="0.5" 
              value={localSettings.target_hours} 
              onChange={e => setLocalSettings({...localSettings, target_hours: Number(e.target.value)})} 
              min="4" max="14" 
              required 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Hora ideal de dormir</label>
              <input type="time" value={localSettings.bedtime_goal} onChange={e => setLocalSettings({...localSettings, bedtime_goal: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Hora ideal de despertar</label>
              <input type="time" value={localSettings.wakeup_goal} onChange={e => setLocalSettings({...localSettings, wakeup_goal: e.target.value})} required />
            </div>
          </div>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Zona de Peligro
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Hard Reset de Sueño</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Elimina todos los registros diarios de sueño permanentemente.</p>
            </div>
            <button 
              type="button"
              onClick={async () => {
                if (window.confirm('¿ESTÁS SEGURO? Se borrará todo tu historial de sueño y configuración.')) {
                   try {
                     await sleepService.deleteAllData();
                     toast.success('Historial eliminado');
                     window.location.reload();
                   } catch (err) {
                     toast.error('Error al reiniciar historial');
                   }
                }
              }} 
              className="btn-primary" 
              style={{ background: 'var(--danger)', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={18} /> Borrar Todo el Historial
            </button>
          </div>
        </section>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontWeight: 800, background: '#8b5cf6', color: 'white' }}>
          <Save size={20} /> Guardar Ajustes
        </button>
      </form>
    </div>
  );
}

SleepSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};
