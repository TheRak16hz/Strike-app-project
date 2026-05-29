import PropTypes from 'prop-types';
import { Activity, Star, Calendar, Trash2 } from 'lucide-react';

export default function SleepStats({ stats, settings, logs, onDelete }) {
  const goal = settings.target_hours || 8;
  const isGoalMet = stats.avg_weekly >= goal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Promedio (7 días)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: isGoalMet ? '#10b981' : (stats.avg_weekly > goal * 0.8 ? '#f59e0b' : '#ef4444') }}>
            {stats.avg_weekly} <span style={{ fontSize: '1rem', opacity: 0.6 }}>h</span>
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Meta: {goal}h</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Racha Saludable</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>
            {stats.healthy_streak} <span style={{ fontSize: '1rem', opacity: 0.6 }}>días</span>
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Entre 7-9 horas</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Activity size={18} color="#8b5cf6" /> Estadísticas Generales</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Promedio Mensual</span>
          <span style={{ fontWeight: 700 }}>{stats.avg_monthly} h</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Calidad Promedio</span>
          <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>{stats.avg_quality} <Star size={14} color="#f59e0b" fill="#f59e0b"/></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Registros Totales</span>
          <span style={{ fontWeight: 700 }}>{stats.total_logs}</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><Calendar size={18} color="#8b5cf6" /> Historial Reciente</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.5 }}>No hay registros recientes</div>
          ) : (
            logs.map((log, i) => {
              const isGood = Number(log.hours) >= 7 && Number(log.hours) <= 9;
              return (
                <div key={log.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: log.tag === 'siesta' ? '3px solid #f59e0b' : (log.tag === 'descanso' ? '3px solid #10b981' : '3px solid #8b5cf6') }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(log.log_date.split('T')[0] + 'T12:00:00Z').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      {log.tag && log.tag !== 'dormir' && (
                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '8px', background: log.tag === 'siesta' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: log.tag === 'siesta' ? '#f59e0b' : '#10b981', textTransform: 'uppercase', fontWeight: 800 }}>
                          {log.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>{log.bedtime ? `${log.bedtime} - ${log.wakeup_time}` : 'Sin hora'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <div style={{ fontWeight: 800, color: isGood ? '#10b981' : (Number(log.hours) < 6 ? '#ef4444' : '#f59e0b') }}>{log.hours}h</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const q = Number(log.quality) || 3;
                          const fillPercent = q >= star ? '100%' : (q === star - 0.5 ? '50%' : '0%');
                          return (
                            <div key={star} style={{ position: 'relative', display: 'inline-block', width: '12px', height: '12px' }}>
                              <Star size={12} color="rgba(255,255,255,0.2)" fill="none" style={{ position: 'absolute', left: 0, top: 0 }} />
                              <div style={{ position: 'absolute', left: 0, top: 0, width: fillPercent, overflow: 'hidden' }}>
                                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {onDelete && (
                      <button onClick={() => onDelete(log.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

SleepStats.propTypes = {
  stats: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  logs: PropTypes.array.isRequired,
  onDelete: PropTypes.func
};
