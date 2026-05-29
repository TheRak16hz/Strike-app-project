import { useState, useEffect } from 'react';
import { BarChart2, X, Droplets, Coffee, Candy, Flame } from 'lucide-react';
import { nutritionService } from '../../services/nutritionService';

export default function NutritionHistory({ settings }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await nutritionService.getHistory(days);
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  const calorieGoal = settings?.calorie_goal || 2000;
  const waterGoal = settings?.water_goal_ml || 1920;
  const caffeineLimit = settings?.caffeine_limit_mg || 400;
  const sugarLimit = settings?.sugar_limit_g || 50;

  const fmt = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const bar = (value, max, color) => {
    const pct = Math.min((value / max) * 100, 100);
    const over = value > max;
    return (
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: over ? '#ef4444' : color, borderRadius: '10px', transition: 'width 0.4s ease' }} />
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--primary)" /> Historial Nutricional
        </h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, background: days === d ? 'var(--primary)' : 'rgba(255,255,255,0.07)', color: days === d ? '#000' : 'rgba(255,255,255,0.6)', transition: '0.2s' }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
        {[
          { icon: <Flame size={13} />, label: 'Calorías', color: 'var(--primary)' },
          { icon: <Droplets size={13} />, label: 'Agua', color: '#3b82f6' },
          { icon: <Coffee size={13} />, label: 'Cafeína', color: '#a8a29e' },
          { icon: <Candy size={13} />, label: 'Azúcar', color: '#f472b6' },
        ].map(item => (
          <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7, color: item.color }}>
            {item.icon} {item.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Cargando historial...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.3rem' }}>
          {history.map((day) => {
            const cals = Math.round(Number(day.total_calories));
            const water = Math.round(Number(day.total_water_ml));
            const caf = Math.round(Number(day.total_caffeine_mg));
            const sugar = Math.round(Number(day.total_sugar_g));
            const isEmpty = cals === 0 && water === 0 && caf === 0 && sugar === 0;

            return (
              <div key={day.log_date} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(day.log_date)}</span>
                  {isEmpty && <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>Sin datos</span>}
                </div>

                {!isEmpty && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Flame size={11} /> {cals} kcal</span>
                        <span style={{ opacity: 0.5 }}>meta {calorieGoal}</span>
                      </div>
                      {bar(cals, calorieGoal, 'var(--primary)')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Droplets size={11} /> {water} ml</span>
                        <span style={{ opacity: 0.5 }}>meta {waterGoal}</span>
                      </div>
                      {bar(water, waterGoal, '#3b82f6')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#a8a29e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Coffee size={11} /> {caf} mg</span>
                        <span style={{ opacity: 0.5 }}>límite {caffeineLimit}</span>
                      </div>
                      {bar(caf, caffeineLimit, '#a8a29e')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#f472b6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Candy size={11} /> {sugar} g</span>
                        <span style={{ opacity: 0.5 }}>límite {sugarLimit}</span>
                      </div>
                      {bar(sugar, sugarLimit, '#f472b6')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
