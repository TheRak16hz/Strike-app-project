import PropTypes from 'prop-types';
import { Coffee, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CaffeineTracker({ logs, settings, onLogCaffeine, onDeleteCaffeine }) {
  const currentMg = logs.reduce((sum, log) => sum + Number(log.amount_mg), 0);
  const limitMg = settings.caffeine_limit_mg || 400;
  const progress = Math.min((currentMg / limitMg) * 100, 100);

  let statusColor = '#10b981'; // Green
  let statusText = 'Saludable';
  if (currentMg > limitMg) {
    statusColor = '#ef4444'; // Red
    statusText = 'Excedido';
  } else if (currentMg > limitMg * 0.75) {
    statusColor = '#f59e0b'; // Orange
    statusText = 'Precaución';
  }

  const quickAdd = [
    { amount: 95, label: 'Café (Taza)', icon: '☕' },
    { amount: 63, label: 'Espresso', icon: '☕' },
    { amount: 47, label: 'Té Negro', icon: '🫖' },
    { amount: 80, label: 'Energizante', icon: '⚡' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a8a29e' }}>
          <Coffee size={20} /> Cafeína
        </h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: statusColor, background: `rgba(${statusColor === '#10b981' ? '16,185,129' : (statusColor === '#ef4444' ? '239,68,68' : '245,158,11')}, 0.1)`, padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
          {statusText}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          <span>Consumo actual:</span>
          <span style={{ color: statusColor }}>{currentMg} / {limitMg} mg</span>
        </div>
        <div className="progress-bar-container" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: statusColor }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', opacity: 0.5, marginTop: '0.3rem' }}>
          <span>0mg</span>
          <span>Límite FDA ({limitMg}mg)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {quickAdd.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              onLogCaffeine({ amount_mg: item.amount, source: item.label, cups: 1 });
              toast.success(`+${item.amount}mg de cafeína añadidos`);
            }}
            style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', transition: '0.2s' }}
            title={item.label}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a8a29e' }}>{item.amount}mg</span>
          </button>
        ))}
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
                <strong style={{ color: '#a8a29e' }}>{log.amount_mg} mg</strong>
                <button onClick={() => onDeleteCaffeine(log.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

CaffeineTracker.propTypes = {
  logs: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  onLogCaffeine: PropTypes.func.isRequired,
  onDeleteCaffeine: PropTypes.func.isRequired,
};
