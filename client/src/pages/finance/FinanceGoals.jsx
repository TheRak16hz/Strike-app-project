import PropTypes from 'prop-types';
import { useState } from 'react';
import { Target, ArrowUpRight, ArrowDownRight, Edit2, Trash2, Calendar, TrendingUp, ChevronDown, ChevronUp, Plus } from 'lucide-react';

export default function FinanceGoals({
  goals,
  transactions,
  onNewGoal,
  onAdjustGoal,
  onEditGoal,
  onDeleteGoal
}) {
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  const toggleExpand = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const getGoalHistory = (goalId) => {
    return transactions.filter(t => Number(t.goal_id) === Number(goalId));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Cards & KPI */}
      <div 
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.08), rgba(var(--primary-rgb),0.02))',
          border: '1px solid rgba(var(--primary-rgb),0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'rgba(var(--primary-rgb),0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Metas de Ahorro</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Tienes {goals.length} metas activas en tu plan financiero.
            </p>
          </div>
        </div>

        <button
          onClick={onNewGoal}
          className="btn-primary"
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Plus size={16} /> Nueva Meta
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', opacity: 0.7 }}>
            <Target size={40} style={{ marginBottom: '1rem', color: 'var(--primary)', opacity: 0.5 }} />
            <h3 style={{ margin: 0 }}>Sin metas configuradas</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Define un objetivo financiero para comenzar a apartar y ahorrar tus fondos.
            </p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Math.min((Number(goal.current_amount) / (Number(goal.target_amount) || 1)) * 100, 100);
            const history = getGoalHistory(goal.id);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div 
                key={goal.id} 
                className="glass-panel animate-scale" 
                style={{ 
                  padding: '1.25rem', 
                  border: `1px solid ${isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                  background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent',
                  transition: 'border-color 0.3s'
                }}
              >
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                    <span style={{ fontSize: '1.8rem', padding: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>{goal.icon || '🎯'}</span>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {goal.title}
                      </h4>
                      {goal.deadline && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                          <Calendar size={12} /> Límite: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => onAdjustGoal(goal)} 
                      className="btn-primary" 
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.75rem', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        fontWeight: 700 
                      }}
                    >
                      Ajustar Fondos
                    </button>
                    <button 
                      onClick={() => onEditGoal(goal)} 
                      style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }} 
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={() => onDeleteGoal(goal.id)} 
                      style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} 
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <span>${Number(goal.current_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontWeight: 400, opacity: 0.5, fontSize: '0.75rem' }}>ahorrado</span></span>
                  <span style={{ opacity: 0.6 }}>Objetivo: ${Number(goal.target_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-container" style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: goal.color || 'var(--primary)', height: '100%', borderRadius: '999px', transition: 'width 0.4s' }}></div>
                </div>

                {/* Forecast & Expand controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {goal.estDate && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.35rem 0.6rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      color: goal.status === 'delayed' ? '#ef4444' : (goal.status === 'completed' ? '#10b981' : 'var(--text-secondary)'),
                      fontWeight: 600
                    }}>
                      <span>Pronóstico: {goal.statusLabel || 'En curso'} · {goal.estDate}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => toggleExpand(goal.id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-secondary)', 
                      cursor: 'pointer', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.2rem',
                      marginLeft: 'auto'
                    }}
                  >
                    {isExpanded ? (
                      <>Ocultar movimientos <ChevronUp size={14} /></>
                    ) : (
                      <>Ver movimientos ({history.length}) <ChevronDown size={14} /></>
                    )}
                  </button>
                </div>

                {/* Expanded Goal Transaction History */}
                {isExpanded && (
                  <div className="animate-scale" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Historial de Movimientos</h5>
                    {history.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.5, fontSize: '0.75rem' }}>Aún no hay transacciones para esta meta.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {history.map(tx => {
                          const isAdd = tx.type === 'saving' || tx.type === 'income';
                          const sign = isAdd ? '+' : '-';
                          const color = isAdd ? '#10b981' : '#3b82f6';
                          const Icon = isAdd ? ArrowUpRight : ArrowDownRight;

                          return (
                            <div 
                              key={tx.id} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '0.6rem 0.8rem', 
                                background: 'rgba(255,255,255,0.01)', 
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                <div style={{ padding: '0.3rem', background: isAdd ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)', borderRadius: '6px' }}>
                                  <Icon size={12} color={color} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {tx.description || tx.category}
                                  </p>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()} · {tx.source || 'Sin fuente'}</span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '0.8rem', color }}>
                                {sign} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

FinanceGoals.propTypes = {
  goals: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired,
  onNewGoal: PropTypes.func.isRequired,
  onAdjustGoal: PropTypes.func.isRequired,
  onEditGoal: PropTypes.func.isRequired,
  onDeleteGoal: PropTypes.func.isRequired
};
