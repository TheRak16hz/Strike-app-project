import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Droplet, Coffee, Apple, Moon, Dumbbell, Leaf, TrendingUp, Zap, BarChart2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { financeService } from '../services/financeService';
import { habitService } from '../services/habitService';
import { sleepService } from '../services/sleepService';
import { nutritionService } from '../services/nutritionService';
import { trainingService } from '../services/trainingService';
import { getSeedData } from '../services/seedService';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

// Helpers
const getVeDate = (date = new Date()) => new Date(date.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
const getVeDateString = (date = new Date()) => {
  const d = getVeDate(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Efficiency calculation functions
const calcHabitEfficiency = (habits) => {
  const regularHabits = habits.filter(h => !h.is_one_time);
  if (!regularHabits.length) return 0;

  let totalGoals = 0;
  let totalCompleted = 0;

  regularHabits.forEach(h => {
    if (h.type === 'inverse') {
      totalGoals += 1;
      totalCompleted += h.completedCountToday === 0 ? 1 : 0;
    } else {
      const goal = h.type === 'quantifiable' ? h.target_value : h.frequency_count;
      totalGoals += goal;
      totalCompleted += Math.min(h.completedCountToday, goal);
    }
  });

  return totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;
};

const calcOneTimeHabitEfficiency = (habits) => {
  const oneTimeHabits = habits.filter(h => h.is_one_time);
  if (!oneTimeHabits.length) return 0;
  const completed = oneTimeHabits.filter(h => h.isCompletedToday).length;
  return Math.round((completed / oneTimeHabits.length) * 100);
};

const calcNutritionEfficiency = (nutritionData) => {
  if (!nutritionData || !nutritionData.food_logs) return 0;
  const { food_logs, settings } = nutritionData;
  const goalCals = settings?.calorie_goal || 2000;

  const todayStr = getVeDateString();
  const todayLogs = food_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
  const todayCals = todayLogs.reduce((acc, l) => acc + (Number(l.calories) || 0), 0);

  if (todayCals === 0) return 0;
  // Closer to goal = better. Overshoot penalizes too.
  const ratio = todayCals / goalCals;
  if (ratio <= 1) return Math.round(ratio * 100);
  // Overshoot: linearly penalize, 200% = 0%
  return Math.max(0, Math.round((2 - ratio) * 100));
};

const calcWaterEfficiency = (nutritionData) => {
  if (!nutritionData || !nutritionData.water_logs) return 0;
  const { water_logs, settings } = nutritionData;
  const goalMl = settings?.water_goal_ml || 1920;

  const todayStr = getVeDateString();
  const todayLogs = water_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
  const totalMl = todayLogs.reduce((acc, l) => acc + (Number(l.amount_ml) || 0), 0);

  return Math.min(100, Math.round((totalMl / goalMl) * 100));
};

const calcCaffeineEfficiency = (nutritionData) => {
  if (!nutritionData || !nutritionData.caffeine_logs) return 100; // No caffeine = perfect
  const { caffeine_logs, settings } = nutritionData;
  const limitMg = settings?.caffeine_limit_mg || 400;

  const todayStr = getVeDateString();
  const todayLogs = caffeine_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
  const totalMg = todayLogs.reduce((acc, l) => acc + (Number(l.amount_mg) || 0), 0);

  if (totalMg === 0) return 100;
  // Under limit = good, over limit = bad
  if (totalMg <= limitMg) return Math.round(((limitMg - totalMg) / limitMg) * 50 + 50); // 50-100%
  return Math.max(0, Math.round((1 - (totalMg - limitMg) / limitMg) * 50)); // 0-50%
};

const calcSleepEfficiency = (sleepData) => {
  if (!sleepData || !sleepData.logs || !sleepData.logs.length) return 0;
  const { logs, settings } = sleepData;
  const targetHours = settings?.target_hours || 8;

  // Use most recent 7 logs
  const recent = logs.slice(0, 7);
  let totalScore = 0;

  recent.forEach(s => {
    const hours = Number(s.hours) || 0;
    const quality = Number(s.quality) || 3;

    // Duration score: how close to target (max 50 points)
    const durationRatio = Math.min(hours / targetHours, 1.2);
    const durationScore = durationRatio <= 1 ? durationRatio * 50 : Math.max(0, (2.4 - durationRatio) * 50 / 1.4);

    // Quality score: out of 5 (max 50 points)
    const qualityScore = (quality / 5) * 50;

    totalScore += durationScore + qualityScore;
  });

  return Math.round(totalScore / recent.length);
};

const calcExerciseEfficiency = (trainingLogs) => {
  if (!trainingLogs || !trainingLogs.length) return 0;

  const nowVe = getVeDate();
  const currentMonth = nowVe.getMonth();
  const currentYear = nowVe.getFullYear();

  // Sessions this month
  const sessionsThisMonth = trainingLogs.filter(s => {
    const d = getVeDate(new Date(s.date));
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Target: 12 sessions/month (~3/week)
  const targetSessions = 12;
  const consistencyScore = Math.min(100, Math.round((sessionsThisMonth / targetSessions) * 100));

  return consistencyScore;
};

const calcSeedEfficiency = (seedData) => {
  if (!seedData) return 0;
  const streak = seedData.current_streak || 0;
  // 30 day streak = 100%
  return Math.min(100, Math.round((streak / 30) * 100));
};

const calcFinanceSavingsEfficiency = (financeData) => {
  if (!financeData || !financeData.transactions) return 0;
  const { transactions, settings } = financeData;
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

  const monthlyIncome = transactions
    .filter(t => {
      const d = getVeDate(new Date(t.date));
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

  const monthlyExpense = transactions
    .filter(t => {
      const d = getVeDate(new Date(t.date));
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

  if (monthlyIncome === 0) {
    return monthlyExpense === 0 ? 100 : 0;
  }

  const savingsRate = (monthlyIncome - monthlyExpense) / monthlyIncome;
  if (savingsRate <= 0) return 0;
  return Math.min(100, Math.round((savingsRate / 0.2) * 100));
};

const calcFinanceGoalsEfficiency = (financeData) => {
  if (!financeData || !financeData.goals || !financeData.goals.length) return 0;
  const { goals } = financeData;
  const avgProgress = goals.reduce((acc, g) => {
    const target = Number(g.target_amount) || 1;
    const current = Number(g.current_amount) || 0;
    return acc + Math.min(current / target, 1);
  }, 0) / goals.length;
  return Math.round(avgProgress * 100);
};

// Color for efficiency level
const getEfficiencyColor = (value) => {
  if (value >= 80) return '#10b981';
  if (value >= 60) return '#3b82f6';
  if (value >= 40) return '#f59e0b';
  if (value >= 20) return '#f97316';
  return '#ef4444';
};

const getEfficiencyLabel = (value) => {
  if (value >= 90) return 'Excelente';
  if (value >= 70) return 'Muy Bien';
  if (value >= 50) return 'Bien';
  if (value >= 30) return 'Regular';
  if (value >= 10) return 'Bajo';
  return 'Sin datos';
};

export default function Stats() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [raw, setRaw] = useState({
    habits: [],
    finance: null,
    sleep: null,
    nutrition: null,
    training: [],
    routines: [],
    seed: null
  });

  useEffect(() => {
    loadAllStats();
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const loadAllStats = async () => {
    try {
      const isTheRak = user?.username === 'TheRak16hz';

      const promises = [
        habitService.getAll().catch(() => []),
        financeService.getFinanceData().catch(() => null),
        sleepService.getSleepData().catch(() => null),
        nutritionService.getDailyData().catch(() => null),
        trainingService.getLogs().catch(() => []),
        trainingService.getRoutines().catch(() => []),
        isTheRak && user?.token ? getSeedData(user.token).catch(() => null) : Promise.resolve(null)
      ];

      const [habitsRes, financeRes, sleepRes, nutritionRes, trainingRes, routinesRes, seedRes] = await Promise.all(promises);

      setRaw({
        habits: habitsRes || [],
        finance: financeRes,
        sleep: sleepRes,
        nutrition: nutritionRes,
        training: trainingRes || [],
        routines: routinesRes || [],
        seed: seedRes
      });
    } catch (err) {
      console.error('Error loading global stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTheRak = user?.username === 'TheRak16hz';

  const metrics = useMemo(() => {
    const base = [];

    // 1. Hábitos Regulares
    const regularHabits = raw.habits.filter(h => !h.is_one_time);
    base.push({
      key: 'habits',
      label: 'Hábitos',
      icon: Activity,
      color: 'var(--primary)',
      value: calcHabitEfficiency(raw.habits),
      description: 'Porcentaje de tus hábitos diarios completados hoy vs sus metas.',
      detail: `${regularHabits.filter(h => h.isCompletedToday).length}/${regularHabits.length} hábitos completados hoy`
    });

    // 2. Tareas Únicas (si existen)
    const oneTimeHabits = raw.habits.filter(h => h.is_one_time);
    if (oneTimeHabits.length > 0) {
      base.push({
        key: 'one_time_tasks',
        label: 'Tareas Únicas',
        icon: CheckCircle,
        color: '#22c55e',
        value: calcOneTimeHabitEfficiency(raw.habits),
        description: 'Porcentaje de tareas de una sola vez (one-time) completadas hoy.',
        detail: `${oneTimeHabits.filter(h => h.isCompletedToday).length}/${oneTimeHabits.length} completadas hoy`
      });
    }

    // 3. Alimentación / Dieta
    base.push({
      key: 'nutrition',
      label: 'Alimentación',
      icon: Apple,
      color: '#f59e0b',
      value: calcNutritionEfficiency(raw.nutrition),
      description: 'Qué tan cerca estás de tu meta calórica diaria. Se penaliza comer de más.',
      detail: (() => {
        if (!raw.nutrition?.food_logs) return 'Sin datos hoy';
        const todayStr = getVeDateString();
        const todayLogs = raw.nutrition.food_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
        const cals = todayLogs.reduce((a, l) => a + (Number(l.calories) || 0), 0);
        const goal = raw.nutrition.settings?.calorie_goal || 2000;
        return `${cals} / ${goal} kcal consumidas`;
      })()
    });

    // 4. Agua
    base.push({
      key: 'water',
      label: 'Agua',
      icon: Droplet,
      color: '#3b82f6',
      value: calcWaterEfficiency(raw.nutrition),
      description: 'Porcentaje de tu meta de hidratación diaria alcanzada.',
      detail: (() => {
        if (!raw.nutrition?.water_logs) return 'Sin datos hoy';
        const todayStr = getVeDateString();
        const todayLogs = raw.nutrition.water_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
        const ml = todayLogs.reduce((a, l) => a + (Number(l.amount_ml) || 0), 0);
        const goal = raw.nutrition.settings?.water_goal_ml || 1920;
        return `${ml} / ${goal} ml consumidos`;
      })()
    });

    // 5. Cafeína
    base.push({
      key: 'caffeine',
      label: 'Cafeína Baja',
      icon: Coffee,
      color: '#8b5cf6',
      value: calcCaffeineEfficiency(raw.nutrition),
      description: 'Mientras menos cafeína consumas, mayor es tu eficiencia. Quedarte bajo el límite = alto puntaje.',
      detail: (() => {
        if (!raw.nutrition?.caffeine_logs) return 'Sin consumo hoy — perfecto';
        const todayStr = getVeDateString();
        const todayLogs = raw.nutrition.caffeine_logs.filter(l => (l.date || l.created_at || '').split('T')[0] === todayStr);
        const mg = todayLogs.reduce((a, l) => a + (Number(l.amount_mg) || 0), 0);
        const limit = raw.nutrition.settings?.caffeine_limit_mg || 400;
        return mg === 0 ? '0 mg — libre de cafeína ☕' : `${mg} / ${limit} mg (límite)`;
      })()
    });

    // 6. Sueño
    base.push({
      key: 'sleep',
      label: 'Sueño',
      icon: Moon,
      color: '#6366f1',
      value: calcSleepEfficiency(raw.sleep),
      description: 'Combina duración (vs tu meta) y calidad reportada de los últimos 7 registros.',
      detail: (() => {
        if (!raw.sleep?.logs?.length) return 'Sin registros de sueño';
        const recent = raw.sleep.logs.slice(0, 7);
        const avgQuality = (recent.reduce((a, s) => a + (Number(s.quality) || 0), 0) / recent.length).toFixed(1);
        return `Calidad promedio: ${avgQuality}/5 (últimos ${recent.length} días)`;
      })()
    });

    // 7. Ejercicio (si existe)
    const exerciseExists = (raw.routines && raw.routines.length > 0) || (raw.training && raw.training.length > 0);
    if (exerciseExists) {
      base.push({
        key: 'exercise',
        label: 'Ejercicio',
        icon: Dumbbell,
        color: '#ec4899',
        value: calcExerciseEfficiency(raw.training),
        description: 'Consistencia de entrenamiento este mes. Meta: 12 sesiones/mes (~3/semana).',
        detail: (() => {
          const nowVe = getVeDate();
          const sessionsThisMonth = raw.training.filter(s => {
            const d = getVeDate(new Date(s.date));
            return d.getMonth() === nowVe.getMonth() && d.getFullYear() === nowVe.getFullYear();
          }).length;
          return `${sessionsThisMonth}/12 sesiones este mes`;
        })()
      });
    }

    // 8. Finanzas en Ahorros
    base.push({
      key: 'finance_savings',
      label: 'Ahorro Mensual',
      icon: TrendingUp,
      color: '#10b981',
      value: calcFinanceSavingsEfficiency(raw.finance),
      description: 'Evalúa qué porcentaje de tus ingresos ahorras este mes (meta saludable: 20%).',
      detail: (() => {
        if (!raw.finance?.transactions) return 'Sin datos financieros';
        const nowVe = getVeDate();
        const currentMonth = nowVe.getMonth();
        const currentYear = nowVe.getFullYear();
        
        const convertToUSD = (amount, currency) => {
          const val = Number(amount) || 0;
          if (currency === 'USD' || currency === 'USDT') return val;
          const rates = raw.finance.settings?.exchange_rates || { usd_bs: 1, usd_bs_bcv: 1, usd_cop: 1 };
          const rateKey = currency === 'BS' ? 'usd_bs' : currency === 'BS_BCV' ? 'usd_bs_bcv' : currency === 'COP' ? 'usd_cop' : currency;
          const rate = Number(rates[rateKey]) || 1;
          return val / rate;
        };

        const monthlyIncome = raw.finance.transactions
          .filter(t => {
            const d = getVeDate(new Date(t.date));
            return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

        const monthlyExpense = raw.finance.transactions
          .filter(t => {
            const d = getVeDate(new Date(t.date));
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((acc, t) => acc + convertToUSD(t.amount, t.currency), 0);

        const savings = monthlyIncome - monthlyExpense;
        return `Ingresos: $${Math.round(monthlyIncome)} | Gastos: $${Math.round(monthlyExpense)} (Neto: $${Math.round(savings)})`;
      })()
    });

    // 9. Metas Financieras (si existen)
    const goalsExist = raw.finance?.goals && raw.finance.goals.length > 0;
    if (goalsExist) {
      base.push({
        key: 'finance_goals',
        label: 'Metas Financieras',
        icon: TrendingUp,
        color: '#14b8a6',
        value: calcFinanceGoalsEfficiency(raw.finance),
        description: 'Progreso promedio acumulado en todas tus metas de ahorro activas.',
        detail: (() => {
          const activeGoals = raw.finance.goals.filter(g => Number(g.current_amount) < Number(g.target_amount)).length;
          return `${activeGoals} metas activas, ${raw.finance.goals.length} metas totales`;
        })()
      });
    }

    // 10. Seed (solo para TheRak16hz)
    if (isTheRak) {
      base.push({
        key: 'seed',
        label: 'Seed',
        icon: Leaf,
        color: '#10b981',
        value: calcSeedEfficiency(raw.seed),
        description: 'Racha actual de días limpios. 30 días = 100% de eficiencia.',
        detail: (() => {
          if (!raw.seed) return 'Sin datos';
          return `Racha actual: ${raw.seed.current_streak || 0} días`;
        })()
      });
    }

    return base;
  }, [raw, isTheRak]);

  const radarData = useMemo(() => {
    return metrics.map(m => ({
      subject: m.label,
      value: m.value,
      fullMark: 100,
      axisLabel: `${m.label} ${m.value}%`
    }));
  }, [metrics]);

  const overallScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length);
  }, [metrics]);

  if (loading) return <div className="loading-state">Calculando eficiencia global...</div>;

  return (
    <div className="app-container stats-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BarChart2 size={28} color="var(--primary)" />
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Eficiencia Global</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          Tu rendimiento actual en cada área de Strike
        </p>
      </div>

      {/* Overall Score Circle */}
      <div className="glass-panel" style={{
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={getEfficiencyColor(overallScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 100) * 263.9} 263.9`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: getEfficiencyColor(overallScore), lineHeight: 1 }}>
              {overallScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
              GLOBAL
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: getEfficiencyColor(overallScore),
          marginTop: '0.25rem'
        }}>
          {getEfficiencyLabel(overallScore)}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}>
          Mapa de Eficiencia
        </h3>
        <div style={{ width: '100%', height: 350, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? '55%' : '75%'} data={radarData}>
              <PolarGrid stroke="var(--border-light)" />
              <PolarAngleAxis
                dataKey="axisLabel"
                tick={{ fill: 'var(--text-primary)', fontSize: isMobile ? 8 : 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: 'var(--primary)' }}
                formatter={(value) => [`${value}%`, 'Eficiencia']}
              />
              <Radar
                name="Eficiencia"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="var(--primary)"
                fillOpacity={0.3}
                animationDuration={1200}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Description box */}
        <div style={{
          minHeight: '50px',
          width: '100%',
          padding: '1rem',
          background: 'rgba(var(--primary-rgb), 0.03)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1rem',
          transition: 'all 0.3s ease'
        }}>
          {hoveredMetric ? (
            <div className="animate-fade-in">
              <span style={{ fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginRight: '0.5rem' }}>
                {hoveredMetric.label}:
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {hoveredMetric.description}
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Toca una métrica para ver cómo se calcula
            </span>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {metrics.map(m => {
          const Icon = m.icon;
          const isExpanded = expandedCard === m.key;
          return (
            <div
              key={m.key}
              className="glass-panel hover-scale"
              onClick={() => setExpandedCard(isExpanded ? null : m.key)}
              onMouseEnter={() => setHoveredMetric(m)}
              onMouseLeave={() => setHoveredMetric(null)}
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isExpanded ? `1px solid ${m.color}` : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${m.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} color={m.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: getEfficiencyColor(m.value), lineHeight: 1.2 }}>
                      {m.value}%
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {/* Mini progress bar */}
                  <div style={{
                    width: '60px',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${m.value}%`,
                      height: '100%',
                      borderRadius: '3px',
                      background: getEfficiencyColor(m.value),
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                  {isExpanded ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
                </div>
              </div>

              {/* Expandable detail */}
              {isExpanded && (
                <div className="animate-fade-in" style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {m.description}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(var(--primary-rgb), 0.05)',
                    borderRadius: '8px'
                  }}>
                    <Zap size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} color={m.color} />
                    {m.detail}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
