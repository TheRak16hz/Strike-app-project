import { useState } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}

export default function SleepLogForm({ onLogSleep }) {
  const [logDate, setLogDate] = useState(getYesterdayDate());
  const [hours, setHours] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [wakeupTime, setWakeupTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState('dormir');

  const calculateHours = (bed, wake) => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);
    let diffMin = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (diffMin < 0) diffMin += 24 * 60;
    return Number((diffMin / 60).toFixed(2));
  };

  const calculateWakeup = (bed, h) => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const totalMinutes = bedHour * 60 + bedMin + Number(h) * 60;
    const wakeHour = Math.floor(totalMinutes / 60) % 24;
    const wakeMin = Math.round(totalMinutes % 60);
    return `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`;
  };

  const handleBedtimeChange = (e) => {
    const val = e.target.value;
    setBedtime(val);
    if (val && hours) {
      setWakeupTime(calculateWakeup(val, hours));
    } else if (val && wakeupTime) {
      setHours(calculateHours(val, wakeupTime));
    }
  };

  const handleWakeupChange = (e) => {
    const val = e.target.value;
    setWakeupTime(val);
    if (val && bedtime) {
      setHours(calculateHours(bedtime, val));
    }
  };

  const handleHoursChange = (e) => {
    const val = e.target.value;
    setHours(val);
    if (val && bedtime) {
      setWakeupTime(calculateWakeup(bedtime, val));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hours || isNaN(hours)) {
      return toast.error('Ingresa las horas de sueño');
    }
    onLogSleep({ log_date: logDate, hours: Number(hours), bedtime, wakeup_time: wakeupTime, quality, notes, tag });
    toast.success('Sueño registrado');
    
    setLogDate(getYesterdayDate());
    setHours('');
    setBedtime('');
    setWakeupTime('');
    setQuality(3);
    setNotes('');
    setTag('dormir');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
        <Moon size={20} /> Registrar Sueño
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div className="form-group" style={{ minWidth: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} opacity={0.7}/> Fecha del registro</label>
          <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} max={new Date().toLocaleDateString('en-CA')} style={{ width: '100%', boxSizing: 'border-box' }} />
          <span style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '0.25rem' }}>Por defecto: ayer</span>
        </div>

        <div className="form-group">
          <label>Tipo de Registro</label>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '12px' }}>
            <button type="button" onClick={() => setTag('dormir')} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: tag === 'dormir' ? '#8b5cf6' : 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Sueño Nocturno</button>
            <button type="button" onClick={() => setTag('siesta')} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: tag === 'siesta' ? '#f59e0b' : 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Siesta</button>
            <button type="button" onClick={() => setTag('descanso')} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', background: tag === 'descanso' ? '#10b981' : 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Descanso</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Moon size={14} opacity={0.7}/> Hora de dormir</label>
            <input type="time" value={bedtime} onChange={handleBedtimeChange} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label>Horas Totales</label>
            <input type="number" step="0.01" min="0" max="24" value={hours} onChange={handleHoursChange} placeholder="Ej. 7.50" required autoFocus style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Sun size={14} opacity={0.7}/> Hora de despertar</label>
            <input type="time" value={wakeupTime} onChange={handleWakeupChange} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>

        {tag !== 'dormir' && (
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Calidad (Estrellas)
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>{quality}</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              {[1, 2, 3, 4, 5].map(star => {
                const fillPercent = quality >= star ? '100%' : (quality === star - 0.5 ? '50%' : '0%');
                return (
                  <div key={star} style={{ position: 'relative', display: 'flex', width: '28px', height: '28px' }}>
                    {/* Empty Background Star */}
                    <Star size={28} color="rgba(255,255,255,0.2)" fill="none" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', display: 'block' }} />
                    
                    {/* Filled Star with clipPath/width trick */}
                    <div style={{ position: 'absolute', left: 0, top: 0, width: fillPercent, height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
                      <Star size={28} color="#f59e0b" fill="#f59e0b" style={{ display: 'block' }} />
                    </div>

                    {/* Clickable areas for half and full */}
                    <div
                      onClick={() => setQuality(star - 0.5)}
                      style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                    />
                    <div
                      onClick={() => setQuality(star)}
                      style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {tag === 'dormir' && (
          <div style={{ padding: '0.5rem', fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>
            La calidad de las estrellas se calculará automáticamente en base a tus horas de sueño.
          </div>
        )}

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
