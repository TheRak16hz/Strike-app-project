import PropTypes from 'prop-types';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function WeeklyTracker({ logs, onDayClick }) {
  const getDaysOfWeek = () => {
    const today = new Date();
    const days = [];
    // Start from Monday (1) to Sunday (0)
    // To make it simple, we can just show the last 7 days ending today.
    // That gives a better "recent progress" view than strict Mon-Sun calendar week.
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0,0,0,0);
      days.push(d);
    }
    return days;
  };

  const days = getDaysOfWeek();

  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLogDateString = (logDateVal) => {
    if (!logDateVal) return '';
    try {
      const d = new Date(logDateVal);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  const getStatusForDay = (date) => {
    const dateStr = toLocalDateString(date);
    const log = logs.find(l => getLogDateString(l.log_date) === dateStr);
    return log ? log.status : null;
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid var(--border-light)',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
      overflowX: 'auto'
    }}>
      {days.map((day, idx) => {
        const status = getStatusForDay(day);
        const isToday = toLocalDateString(day) === toLocalDateString(new Date());
        
        let Icon = null;
        if (status === 'clean') {
          Icon = <CheckCircle2 size={24} color="#10b981" />;
        } else if (status === 'relapse') {
          Icon = <XCircle size={24} color="#ef4444" />;
        } else {
          Icon = <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px dashed var(--border-light)' }} />;
        }

        return (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: day > new Date() ? 0.3 : 1,
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          className="hover-scale"
          onClick={() => onDayClick && onDayClick(day)}>
            <span style={{ 
              fontSize: '0.75rem', 
              color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: isToday ? 700 : 500
            }}>
              {dayNames[day.getDay()]}
            </span>
            <div style={{
              background: isToday ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
              padding: '0.5rem',
              borderRadius: '12px',
              border: isToday ? '1px solid var(--primary)' : '1px solid transparent'
            }}>
              {Icon}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

WeeklyTracker.propTypes = {
  logs: PropTypes.array.isRequired,
  onDayClick: PropTypes.func
};
