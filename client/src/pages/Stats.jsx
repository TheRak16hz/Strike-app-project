import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Droplet, Coffee, Apple, Moon, TrendingUp, Dumbbell, Calendar, Target, Zap, CheckCircle, Leaf } from 'lucide-react';
import { financeService } from '../services/financeService';
import { habitService } from '../services/habitService';
import { sleepService } from '../services/sleepService';
import { nutritionService } from '../services/nutritionService';
import { trainingService } from '../services/trainingService';
import { getSeedData } from '../services/seedService';
import HabitRadarChart from '../components/HabitRadarChart';
// Helpers
const getVeDate = (date = new Date()) => new Date(date.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
const getVeDateString = (date = new Date()) => {
  const d = getVeDate(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Stats() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    habits: [],
    finance: null,
    sleep: [],
    nutrition: [],
    training: [],
    seed: null
  });

  useEffect(() => {
    loadAllStats();
  }, [user]);

  const loadAllStats = async () => {
    try {
      const isTheRak = user?.username === 'TheRak16hz';
      
      // Parallel fetch
      const promises = [
        habitService.getAll().catch(() => []),
        financeService.getFinanceData().catch(() => null),
        sleepService.getSleepData().catch(() => []),
        nutritionService.getDailyData().catch(() => []),
        trainingService.getSessions().catch(() => []),
        isTheRak && user?.token ? getSeedData(user.token).catch(() => null) : Promise.resolve(null)
      ];

      const [habitsRes, financeRes, sleepRes, nutritionRes, trainingRes, seedRes] = await Promise.all(promises);

      setData({
        habits: habitsRes || [],
        finance: financeRes,
        sleep: sleepRes || [],
        nutrition: nutritionRes || [],
        training: trainingRes || [],
        seed: seedRes
      });
    } catch (err) {
      console.error('Error loading global stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- HABITS METRICS ---
  const habitsMetrics = () => {
    const regularHabits = data.habits.filter(h => !h.is_one_time);
    if (!regularHabits.length) return null;
    
    let totalGoals = 0;
    let totalCompleted = 0;
    let longestStreak = 0;
    let totalWater = 0;

    regularHabits.forEach(h => {
      // General Progress
      if (h.type === 'inverse') {
        totalGoals += 1;
        totalCompleted += h.completedCountToday === 0 ? 1 : 0;
      } else {
        const goal = h.type === 'quantifiable' ? h.target_value : h.frequency_count;
        totalGoals += goal;
        totalCompleted += Math.min(h.completedCountToday, goal);
      }
      // Streak
      if (h.current_streak > longestStreak) longestStreak = h.current_streak;
      
      // Try to find "water" or "agua" habit specifically
      if (h.title.toLowerCase().includes('agua') || h.title.toLowerCase().includes('water')) {
        totalWater += h.completedCountToday;
      }
    });

    const percent = totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;
    const activeHabits = regularHabits.length;

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
          <Activity size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Hábitos</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completado Hoy</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{percent}%</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Racha Máxima</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-green)' }}>{longestStreak} <span style={{fontSize:'0.9rem', fontWeight:400}}>días</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hábitos Activos</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{activeHabits}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Agua (Hoy)</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>{totalWater}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- FINANCE METRICS ---
  const financeMetrics = () => {
    if (!data.finance || !data.finance.transactions) return null;
    const { transactions, goals, settings } = data.finance;
    const rates = settings?.exchange_rates || { usd_bs: 1, usd_bs_bcv: 1, usd_cop: 1 };
    
    const convertToUSD = (amount, currency) => {
      const val = Number(amount) || 0;
      if (currency === 'USD' || currency === 'USDT') return val;
      const rateKey = currency === 'BS' ? 'usd_bs' : currency === 'BS_BCV' ? 'usd_bs_bcv' : currency === 'COP' ? 'usd_cop' : currency;
      const rate = Number(rates[rateKey]) || 1;
      return val / rate;
    };

    const nowVe = getVeDate();
    const currentMonth = nowVe.getMonth();
    const currentYear = nowVe.getFullYear();

    const grossTotalUSD = transactions.reduce((acc, t) => {
      const amountUSD = convertToUSD(t.amount, t.currency || 'USD');
      if (t.type === 'income') return acc + amountUSD;
      if (t.type === 'expense') return acc - amountUSD;
      return acc;
    }, 0);

    const totalSavedUSD = goals.reduce((acc, g) => acc + Number(g.current_amount || 0), 0);
    const availableLiquidUSD = Math.max(0, grossTotalUSD - totalSavedUSD);

    const monthlyIncomeUSD = transactions
      .filter(t => {
        const tDate = getVeDate(new Date(t.date));
        return t.type === 'income' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

    const activeGoals = goals.filter(g => Number(g.current_amount) < Number(g.target_amount)).length;

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
          <TrendingUp size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Finanzas</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Disponible (USD)</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>${availableLiquidUSD.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>En Metas</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>${totalSavedUSD.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ingresos Mes</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>+${monthlyIncomeUSD.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Metas Activas</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{activeGoals}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- NUTRITION METRICS ---
  const nutritionMetrics = () => {
    if (!data.nutrition.length) return null;
    
    // Average last 7 days
    const recent = data.nutrition.slice(0, 7);
    const avgCals = recent.reduce((acc, n) => acc + (Number(n.calories) || 0), 0) / recent.length;
    const avgProts = recent.reduce((acc, n) => acc + (Number(n.protein) || 0), 0) / recent.length;
    const avgCaffeine = recent.reduce((acc, n) => acc + (Number(n.caffeine) || 0), 0) / recent.length;
    
    const today = getVeDateString();
    const todayLog = data.nutrition.find(n => n.date.split('T')[0] === today);
    const todayCals = todayLog ? Number(todayLog.calories) : 0;

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f59e0b' }}>
          <Apple size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Nutrición</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calorías (Hoy)</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{todayCals} <span style={{fontSize:'0.9rem', fontWeight:400}}>kcal</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Promedio 7D (Cals)</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{Math.round(avgCals)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Promedio Proteína</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{Math.round(avgProts)} <span style={{fontSize:'0.9rem', fontWeight:400}}>g</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Promedio Cafeína</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>{Math.round(avgCaffeine)} <span style={{fontSize:'0.9rem', fontWeight:400}}>mg</span></p>
          </div>
        </div>
      </div>
    );
  };

  // --- SLEEP METRICS ---
  const sleepMetrics = () => {
    if (!data.sleep.length) return null;

    const recent = data.sleep.slice(0, 7);
    let totalMinutes = 0;
    let totalQuality = 0;
    let goodSleepDays = 0;

    recent.forEach(s => {
      const durationMatch = (s.duration || '').match(/(\d+)h\s*(\d+)m/);
      if (durationMatch) {
        totalMinutes += parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
      }
      totalQuality += Number(s.quality) || 0;
      if (Number(s.quality) >= 4) goodSleepDays++;
    });

    const avgMinutes = recent.length ? totalMinutes / recent.length : 0;
    const avgHrs = Math.floor(avgMinutes / 60);
    const avgMins = Math.round(avgMinutes % 60);
    const avgQuality = recent.length ? (totalQuality / recent.length).toFixed(1) : 0;

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6366f1' }}>
          <Moon size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Sueño</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Promedio 7D</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{avgHrs}h {avgMins}m</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calidad Prom.</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>{avgQuality} <span style={{fontSize:'0.9rem', fontWeight:400}}>/ 5</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Días Buen Sueño</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{goodSleepDays} <span style={{fontSize:'0.9rem', fontWeight:400}}>de 7</span></p>
          </div>
        </div>
      </div>
    );
  };

  // --- TRAINING METRICS ---
  const trainingMetrics = () => {
    if (!data.training.length) return null;

    const nowVe = getVeDate();
    const currentMonth = nowVe.getMonth();
    const currentYear = nowVe.getFullYear();

    const sessionsThisMonth = data.training.filter(s => {
      const d = getVeDate(new Date(s.date));
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    let longestStreak = 0;
    let currentStreak = 0;
    
    // Calculate simple streak (consecutive days with training)
    const dates = [...new Set(data.training.map(s => s.date.split('T')[0]))].sort().reverse();
    if (dates.length > 0) {
      const todayStr = getVeDateString();
      let expectedDate = getVeDate();
      
      if (dates[0] === todayStr || dates[0] === getVeDateString(new Date(expectedDate.setDate(expectedDate.getDate() - 1)))) {
         let count = 0;
         let checkDate = getVeDate();
         if (dates[0] !== todayStr) checkDate.setDate(checkDate.getDate() - 1);
         
         for (let i=0; i<dates.length; i++) {
           if (dates[i] === getVeDateString(checkDate)) {
             count++;
             checkDate.setDate(checkDate.getDate() - 1);
           } else {
             break;
           }
         }
         currentStreak = count;
      }
    }

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ec4899' }}>
          <Dumbbell size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Ejercicio</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Entrenos (Mes)</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{sessionsThisMonth}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Racha Actual</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ec4899' }}>{currentStreak} <span style={{fontSize:'0.9rem', fontWeight:400}}>días</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Histórico</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{data.training.length}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- SEED METRICS (Private) ---
  const seedMetrics = () => {
    if (!data.seed) return null;
    
    const cleanDays = data.seed.logs?.filter(l => l.status === 'clean').length || 0;

    return (
      <div className="stat-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
          <Leaf size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Seed</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Racha Actual</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{data.seed.current_streak} <span style={{fontSize:'0.9rem', fontWeight:400}}>días</span></p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Días Limpios</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{cleanDays}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-state">Calculando estadísticas globales...</div>;

  return (
    <div className="stats-page animate-fade-in" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Estadísticas Globales</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Un resumen completo de tu progreso en Strike.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {habitsMetrics()}
        {financeMetrics()}
        {trainingMetrics()}
        {nutritionMetrics()}
        {sleepMetrics()}
        {seedMetrics()}
      </div>

      {data.habits.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Análisis de Hábitos</h3>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <HabitRadarChart habits={data.habits} />
          </div>
        </div>
      )}
    </div>
  );
}
