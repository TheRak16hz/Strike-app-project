import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, Search, Plus, Apple } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddFoodModal({ show, onClose, library, mealType, onAddFood }) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);

  const filteredLibrary = useMemo(() => {
    return library.filter(food => 
      food.name.toLowerCase().includes(search.toLowerCase()) || 
      food.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [library, search]);

  const handleSelect = (food) => {
    setSelectedFood(food);
    setGrams(100);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedFood) return;
    
    const factor = grams / 100;
    onAddFood({
      food_library_id: selectedFood.id,
      food_name: selectedFood.name,
      grams: Number(grams),
      calories: selectedFood.calories_per_100g * factor,
      protein: selectedFood.protein_per_100g * factor,
      carbs: selectedFood.carbs_per_100g * factor,
      fat: selectedFood.fat_per_100g * factor,
      meal_type: mealType
    });
    
    toast.success(`${selectedFood.name} añadido`);
    setSelectedFood(null);
    setSearch('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
      <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><Apple size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, textTransform: 'capitalize' }}>Añadir a {mealType}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {!selectedFood ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Search size={18} opacity={0.5} />
              <input 
                type="text" 
                placeholder="Buscar alimento..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                autoFocus
              />
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              {filteredLibrary.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No se encontraron alimentos. Añádelos en la Librería.</div>
              ) : (
                filteredLibrary.map(food => (
                  <div 
                    key={food.id} 
                    onClick={() => handleSelect(food)}
                    style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{food.emoji} {food.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{food.category} • {food.calories_per_100g} kcal / 100g</div>
                    </div>
                    <Plus size={18} color="var(--primary)" />
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedFood.emoji}</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{selectedFood.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>{selectedFood.calories_per_100g} kcal por cada 100g</p>
            </div>

            <div className="form-group">
              <label>Cantidad consumida (gramos / ml)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="number" 
                  value={grams} 
                  onChange={e => setGrams(e.target.value)} 
                  min="1" 
                  required 
                  style={{ flex: 1, fontSize: '1.2rem', padding: '1rem' }}
                  autoFocus
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 700, opacity: 0.5 }}>g</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Calorías a registrar:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {Math.round(selectedFood.calories_per_100g * (grams / 100))} kcal
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>Añadir</button>
              <button type="button" onClick={() => setSelectedFood(null)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>Volver</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

AddFoodModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  library: PropTypes.array.isRequired,
  mealType: PropTypes.string.isRequired,
  onAddFood: PropTypes.func.isRequired,
};
