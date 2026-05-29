import PropTypes from 'prop-types';
import { Target, RefreshCw, Settings } from 'lucide-react';

export default function FinanceHeader({ onNewGoal, onOpenSettings, onResetTransactions, onResetGoals }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 5vw, 1.6rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Finanzas <span style={{ color: 'var(--primary)' }}>Personales</span>
        </h1>
        <div style={{ height: '3px', width: '40px', background: 'var(--primary)', borderRadius: '10px', marginTop: '2px' }}></div>
      </div>

      
      <div className="finance-header-actions" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onResetTransactions} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', cursor: 'pointer' }} title="Reiniciar Movimientos">
          <RefreshCw size={14} /> 
        </button>
        <button onClick={onResetGoals} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', cursor: 'pointer' }} title="Eliminar Metas">
          <Target size={14} />
        </button>
        <button className="theme-toggle" onClick={onOpenSettings} style={{ cursor: 'pointer' }} title="Ajustes">
          <Settings size={20} />
        </button>
        <button className="btn-primary" onClick={onNewGoal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
          <Target size={16} /> <span className="btn-text">Nueva Meta</span>
        </button>
      </div>
    </div>
  );
}

FinanceHeader.propTypes = {
  onNewGoal: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onResetTransactions: PropTypes.func.isRequired,
  onResetGoals: PropTypes.func.isRequired,
};
