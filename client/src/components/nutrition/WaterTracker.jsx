import PropTypes from 'prop-types';
import { Droplet, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaterTracker({ logs, settings, onLogWater, onDeleteWater }) {
  const currentMl = logs.reduce((sum, log) => sum + Number(log.amount_ml), 0);
  const goalMl = settings.water_goal_ml || 1920;
  const progress = Math.min((currentMl / goalMl) * 100, 100);

  const quickAdd = [
    { amount: 240, label: 'Vaso', icon: '🥛' },
    { amount: 500, label: 'Botella', icon: '💧' },
    { amount: 200, label: 'Taza', icon: '☕' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9' }}>
          <Droplet size={20} /> Hidratación
        </h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0ea5e9' }}>
          {currentMl} / {goalMl} ml
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="8" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="226" strokeDashoffset={226 - (226 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
          </svg>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0ea5e9' }}>{Math.round(progress)}%</div>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {quickAdd.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                onLogWater({ amount_ml: item.amount, source: item.label });
                toast.success(`+${item.amount}ml de agua añadidos`);
              }}
              style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', transition: '0.2s' }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{item.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ea5e9' }}>{item.amount} ml</span>
            </button>
          ))}
        </div>
      </div>

      {logs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5 }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>{log.source}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <strong style={{ color: '#0ea5e9' }}>{log.amount_ml} ml</strong>
                <button onClick={() => onDeleteWater(log.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

WaterTracker.propTypes = {
  logs: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  onLogWater: PropTypes.func.isRequired,
  onDeleteWater: PropTypes.func.isRequired,
};
