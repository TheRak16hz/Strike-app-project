import PropTypes from 'prop-types';

export default function SeedTree({ streak }) {
  // Logic: 
  // 0-6 days = Seed/Sprout 🌱
  // 7-14 days = Young Tree 🌿
  // 15-29 days = Medium Tree 🌳
  // 30+ days = Large Tree 🌲

  let emoji = '🌱';
  let stageName = 'Semilla';
  let nextGoal = 7;
  let progressToNext = (streak / 7) * 100;

  if (streak >= 30) {
    emoji = '🌲';
    stageName = 'Árbol Inquebrantable';
    nextGoal = null;
    progressToNext = 100;
  } else if (streak >= 15) {
    emoji = '🌳';
    stageName = 'Árbol Fuerte';
    nextGoal = 30;
    progressToNext = ((streak - 15) / 15) * 100;
  } else if (streak >= 7) {
    emoji = '🌿';
    stageName = 'Brote Joven';
    nextGoal = 15;
    progressToNext = ((streak - 7) / 8) * 100;
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-light)',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))', animation: 'float 3s ease-in-out infinite' }}>
        {emoji}
      </div>
      
      <div>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{stageName}</h3>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Racha actual: <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{streak}</strong> días
        </p>
      </div>

      {nextGoal && (
        <div style={{ width: '100%', maxWidth: '300px', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span>Próxima etapa</span>
            <span>{nextGoal} días</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.min(progressToNext, 100)}%`, 
              background: 'var(--primary)',
              transition: 'width 1s ease-in-out',
              borderRadius: '4px'
            }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

SeedTree.propTypes = {
  streak: PropTypes.number.isRequired
};
