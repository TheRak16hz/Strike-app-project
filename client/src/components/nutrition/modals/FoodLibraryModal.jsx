import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Search, Plus, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FoodLibraryModal({ show, onClose, library, onCreateFood, onDeleteFood }) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', category: 'Otros', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '', emoji: '🍽️' });

  const filteredLibrary = library.filter(food => 
    food.name.toLowerCase().includes(search.toLowerCase()) || 
    food.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await onCreateFood(newFood);
      toast.success('Alimento creado en la librería');
      setIsCreating(false);
      setNewFood({ name: '', category: 'Otros', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '', emoji: '🍽️' });
    } catch (err) {
      toast.error('Error al crear alimento');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
      <div className="glass-panel animate-scale" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><BookOpen size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Librería de Alimentos</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreate} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Emoji</label>
                <input type="text" value={newFood.emoji} onChange={e => setNewFood({...newFood, emoji: e.target.value})} maxLength="2" required />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} required autoFocus />
              </div>
            </div>
            
            <div className="form-group">
              <label>Categoría</label>
              <select value={newFood.category} onChange={e => setNewFood({...newFood, category: e.target.value})}>
                <option value="Proteínas">Proteínas</option>
                <option value="Carbohidratos">Carbohidratos</option>
                <option value="Grasas">Grasas</option>
                <option value="Frutas">Frutas</option>
                <option value="Verduras">Verduras</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Valores por cada 100g</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Calorías (kcal)</label>
                  <input type="number" step="0.1" value={newFood.calories_per_100g} onChange={e => setNewFood({...newFood, calories_per_100g: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Proteínas (g)</label>
                  <input type="number" step="0.1" value={newFood.protein_per_100g} onChange={e => setNewFood({...newFood, protein_per_100g: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Carbohidratos (g)</label>
                  <input type="number" step="0.1" value={newFood.carbs_per_100g} onChange={e => setNewFood({...newFood, carbs_per_100g: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Grasas (g)</label>
                  <input type="number" step="0.1" value={newFood.fat_per_100g} onChange={e => setNewFood({...newFood, fat_per_100g: e.target.value})} required />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>Guardar en Librería</button>
              <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Search size={18} opacity={0.5} />
                <input 
                  type="text" 
                  placeholder="Buscar en la librería..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>
              <button onClick={() => setIsCreating(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}>
                <Plus size={18} /> Nuevo
              </button>
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              {filteredLibrary.map(food => (
                <div key={food.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{food.emoji} {food.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{food.category} • {food.calories_per_100g} kcal/100g</div>
                  </div>
                  {food.user_id !== null && (
                    <button onClick={() => onDeleteFood(food.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

FoodLibraryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  library: PropTypes.array.isRequired,
  onCreateFood: PropTypes.func.isRequired,
  onDeleteFood: PropTypes.func.isRequired,
};
