import { useState, useEffect } from 'react';
import { Activity, Edit2 } from 'lucide-react';
import { nutritionService } from '../../services/nutritionService';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

export default function BmiCalculator() {
  const [bmiData, setBmiData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ weight_kg: '', height_cm: '', gender: 'other', birth_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profRes, bmiRes] = await Promise.all([
        nutritionService.getProfile(),
        nutritionService.getBmi()
      ]);
      setProfile({
        weight_kg: profRes.weight_kg || '',
        height_cm: profRes.height_cm || '',
        gender: profRes.gender || 'other',
        birth_date: profRes.birth_date ? profRes.birth_date.split('T')[0] : ''
      });
      if (bmiRes.bmi) setBmiData(bmiRes);
      if (!profRes.weight_kg) setIsEditing(true);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar perfil de salud');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await nutritionService.saveProfile(profile);
      toast.success('Perfil actualizado');
      setIsEditing(false);
      loadData();
    } catch (err) {
      toast.error('Error al guardar perfil');
    }
  };

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Cargando calculadora...</div>;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--primary)" /> Calculadora de IMC
        </h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', opacity: 0.7 }}>
            <Edit2 size={14} /> Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Peso (kg)</label>
              <input type="number" step="0.1" value={profile.weight_kg} onChange={e => setProfile({...profile, weight_kg: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Altura (cm)</label>
              <input type="number" step="0.1" value={profile.height_cm} onChange={e => setProfile({...profile, height_cm: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Género</label>
              <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} required>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" value={profile.birth_date} onChange={e => setProfile({...profile, birth_date: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>Guardar</button>
            {bmiData && <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 0.5, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>Cancelar</button>}
          </div>
        </form>
      ) : (
        bmiData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '50%', border: '4px solid var(--primary)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{bmiData.bmi}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>IMC</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: bmiData.category === 'Normal' ? '#10b981' : (bmiData.category === 'Sobrepeso' ? '#f59e0b' : '#ef4444') }}>{bmiData.category}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Peso ideal est. (Fórmula Devine): <strong style={{ color: 'var(--primary)' }}>{bmiData.ideal_weight_kg} kg</strong></p>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Calorías de Mantenimiento (TDEE)</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{bmiData.tdee_sedentary}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Sedentario</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{bmiData.tdee_moderate}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Moderado</div>
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{bmiData.tdee_active}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Activo</div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
