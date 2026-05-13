import PropTypes from 'prop-types';
import { Plus, Trash2, PieChart } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', icon: '🌅' },
  { id: 'almuerzo', label: 'Almuerzo', icon: '☀️' },
  { id: 'cena', label: 'Cena', icon: '🌙' },
  { id: 'snack', label: 'Snacks', icon: '🍪' },
];

export default function DailyFoodLog({ logs, settings, onAddFoodClick, onDeleteFood }) {
  const currentCals = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const currentProtein = logs.reduce((sum, log) => sum + Number(log.protein), 0);
  const currentCarbs = logs.reduce((sum, log) => sum + Number(log.carbs), 0);
  const currentFat = logs.reduce((sum, log) => sum + Number(log.fat), 0);
  
  const goalCals = settings.calorie_goal || 2000;
  const progressCals = Math.min((currentCals / goalCals) * 100, 100);

  // Group logs by meal type
  const groupedLogs = MEAL_TYPES.map(meal => ({
    ...meal,
    items: logs.filter(l => l.meal_type === meal.id),
    totalCals: logs.filter(l => l.meal_type === meal.id).reduce((sum, l) => sum + Number(l.calories), 0)
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Calorías Totales */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} color="var(--primary)" /> Resumen Calórico
          </h3>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.7 }}>Meta: {goalCals} kcal</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
            {Math.round(currentCals)}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: currentCals > goalCals ? '#ef4444' : 'var(--text-secondary)' }}>
            Restantes: {Math.max(goalCals - Math.round(currentCals), 0)} kcal
          </div>
        </div>

        <div className="progress-bar-container" style={{ height: '10px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
          <div className="progress-bar-fill" style={{ width: `${progressCals}%`, background: currentCals > goalCals ? '#ef4444' : 'var(--primary)' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#ec4899', fontWeight: 700, marginBottom: '0.2rem' }}>PROTEÍNA</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{Math.round(currentProtein)}g</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, marginBottom: '0.2rem' }}>CARBS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{Math.round(currentCarbs)}g</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.2rem' }}>GRASAS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{Math.round(currentFat)}g</div>
          </div>
        </div>
      </div>

      {/* Comidas del Día */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {groupedLogs.map(meal => (
          <div key={meal.id} className="glass-panel" style={{ padding: '1.2rem', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {meal.icon} {meal.label}
              </h4>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(meal.totalCals)} kcal</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {meal.items.length === 0 ? (
                <div style={{ fontSize: '0.85rem', opacity: 0.4, textAlign: 'center', padding: '0.5rem' }}>No hay alimentos registrados</div>
              ) : (
                meal.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.food_name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.grams}g • P: {Math.round(item.protein)} C: {Math.round(item.carbs)} G: {Math.round(item.fat)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{Math.round(item.calories)} kcal</span>
                      <button onClick={() => onDeleteFood(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', padding: 0 }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => onAddFoodClick(meal.id)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: '10px', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: '0.2s', marginBottom: '0.5rem' }}
            >
              <Plus size={16} /> Añadir a {meal.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

DailyFoodLog.propTypes = {
  logs: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  onAddFoodClick: PropTypes.func.isRequired,
  onDeleteFood: PropTypes.func.isRequired,
};
