import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NutritionSettingsModal({ show, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState({
    calorie_goal: 2000,
    calorie_mode: 'maintain',
    water_goal_ml: 1920,
    caffeine_limit_mg: 400
  });

  useEffect(() => {
    if (show && settings) {
      setLocalSettings({
        calorie_goal: settings.calorie_goal || 2000,
        calorie_mode: settings.calorie_mode || 'maintain',
        water_goal_ml: settings.water_goal_ml || 1920,
        caffeine_limit_mg: settings.caffeine_limit_mg || 400
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
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><Settings size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Ajustes de Dieta</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div className="form-group">
            <label>Objetivo Calórico (kcal/día)</label>
            <input 
              type="number" 
              value={localSettings.calorie_goal} 
              onChange={e => setLocalSettings({...localSettings, calorie_goal: Number(e.target.value)})} 
              min="500" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Modo de Dieta</label>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '12px' }}>
              <button type="button" onClick={() => setLocalSettings({...localSettings, calorie_mode: 'deficit'})} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: localSettings.calorie_mode === 'deficit' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Déficit</button>
              <button type="button" onClick={() => setLocalSettings({...localSettings, calorie_mode: 'maintain'})} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: localSettings.calorie_mode === 'maintain' ? '#10b981' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mantener</button>
              <button type="button" onClick={() => setLocalSettings({...localSettings, calorie_mode: 'surplus'})} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: localSettings.calorie_mode === 'surplus' ? '#f59e0b' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Superávit</button>
            </div>
          </div>

          <div className="form-group">
            <label>Meta de Agua (ml/día)</label>
            <input 
              type="number" 
              value={localSettings.water_goal_ml} 
              onChange={e => setLocalSettings({...localSettings, water_goal_ml: Number(e.target.value)})} 
              min="500" 
              step="50"
              required 
            />
          </div>

          <div className="form-group">
            <label>Límite de Cafeína (mg/día)</label>
            <input 
              type="number" 
              value={localSettings.caffeine_limit_mg} 
              onChange={e => setLocalSettings({...localSettings, caffeine_limit_mg: Number(e.target.value)})} 
              min="0" 
              step="10"
              required 
            />
            <span style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.3rem' }}>Recomendación FDA: 400mg</span>
          </div>

        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Zona de Peligro
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Hard Reset Nutrición</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Elimina tu librería de alimentos y registros diarios permanentemente.</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                if (window.confirm('¿ESTÁS SEGURO? Se borrará todo tu historial de nutrición.')) {
                   toast.error('Funcionalidad en desarrollo para API de nutrición');
                }
              }} 
              className="btn-primary" 
              style={{ background: 'var(--danger)', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={18} /> Borrar Todo el Historial
            </button>
          </div>
        </section>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontWeight: 800 }}>
          <Save size={20} /> Guardar Ajustes
        </button>
      </form>
    </div>
  );
}

NutritionSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};
