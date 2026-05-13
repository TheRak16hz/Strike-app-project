import { Apple, Settings } from 'lucide-react';
import PropTypes from 'prop-types';

export default function NutritionHeader({ onSettingsClick }) {
  const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
          <Apple size={24} color="var(--primary)" />
          {date}
        </h2>
        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Tu resumen nutricional del día</p>
      </div>
      <button 
        onClick={onSettingsClick}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer' }}
      >
        <Settings size={20} />
      </button>
    </div>
  );
}

NutritionHeader.propTypes = {
  onSettingsClick: PropTypes.func.isRequired,
};
