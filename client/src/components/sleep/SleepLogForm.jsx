import { useState } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SleepLogForm({ onLogSleep }) {
  const [hours, setHours] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [wakeupTime, setWakeupTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hours || isNaN(hours)) {
      return toast.error('Ingresa las horas de sueño');
    }
    onLogSleep({ hours: Number(hours), bedtime, wakeup_time: wakeupTime, quality, notes });
    toast.success('Sueño registrado');
    
    // Reset but keep quality at 3
    setHours('');
    setBedtime('');
    setWakeupTime('');
    setQuality(3);
    setNotes('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
        <Moon size={20} /> Registrar Sueño (Anoche)
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label>Horas Totales</label>
            <input type="number" step="0.1" min="0" max="24" value={hours} onChange={e => setHours(e.target.value)} placeholder="Ej. 7.5" required autoFocus style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Moon size={14} opacity={0.7}/> Hora de dormir</label>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Sun size={14} opacity={0.7}/> Hora de despertar</label>
            <input type="time" value={wakeupTime} onChange={e => setWakeupTime(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div className="form-group">
          <label>Calidad del Sueño</label>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setQuality(star)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', transition: '0.2s', transform: quality >= star ? 'scale(1.1)' : 'scale(1)' }}
              >
                <Star size={28} color={quality >= star ? '#f59e0b' : 'rgba(255,255,255,0.2)'} fill={quality >= star ? '#f59e0b' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ minWidth: 0 }}>
          <label>Notas (opcional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej. Me desperté varias veces..." style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '1rem', background: '#8b5cf6', color: 'white' }}>Guardar Registro</button>
      </form>
    </div>
  );
}

SleepLogForm.propTypes = {
  onLogSleep: PropTypes.func.isRequired,
};
