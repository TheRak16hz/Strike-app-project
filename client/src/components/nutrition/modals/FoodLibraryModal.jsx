import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Search, Plus, Trash2, BookOpen, Pencil, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FOOD = { name: '', category: 'Otros', meal_type: 'any', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '', emoji: '🍽️' };

const CATEGORIES = ['Proteínas', 'Carbohidratos', 'Grasas', 'Frutas', 'Verduras', 'Lácteos', 'Bebidas', 'Snacks', 'Otros'];
const MEAL_TYPES = [{ value: 'any', label: 'Cualquiera' }, { value: 'desayuno', label: 'Desayuno' }, { value: 'almuerzo', label: 'Almuerzo' }, { value: 'cena', label: 'Cena' }, { value: 'snack', label: 'Snack' }];

export default function FoodLibraryModal({ show, onClose, library, onCreateFood, onDeleteFood, onEditFood }) {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FOOD);

  const filteredLibrary = library.filter(food =>
    food.name.toLowerCase().includes(search.toLowerCase()) ||
    food.category.toLowerCase().includes(search.toLowerCase())
  );

  const startCreate = () => {
    setFormData(EMPTY_FOOD);
    setMode('create');
  };

  const startEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      category: food.category,
      meal_type: food.meal_type || 'any',
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
      emoji: food.emoji,
    });
    setMode('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await onCreateFood(formData);
        toast.success('Alimento creado en la librería');
      } else {
        await onEditFood(editingFood.id, formData);
        toast.success('Alimento actualizado');
      }
      setMode('list');
      setFormData(EMPTY_FOOD);
      setEditingFood(null);
    } catch {
      toast.error('Error al guardar alimento');
    }
  };

  if (!show) return null;

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Emoji</label>
          <input type="text" value={formData.emoji} onChange={e => setFormData({ ...formData, emoji: e.target.value })} maxLength="2" required />
        </div>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required autoFocus />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Categoría</label>
          <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Comida del día</label>
          <select value={formData.meal_type} onChange={e => setFormData({ ...formData, meal_type: e.target.value })}>
            {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Valores por cada 100g</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Calorías (kcal)</label>
            <input type="number" step="0.1" value={formData.calories_per_100g} onChange={e => setFormData({ ...formData, calories_per_100g: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Proteínas (g)</label>
            <input type="number" step="0.1" value={formData.protein_per_100g} onChange={e => setFormData({ ...formData, protein_per_100g: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Carbohidratos (g)</label>
            <input type="number" step="0.1" value={formData.carbs_per_100g} onChange={e => setFormData({ ...formData, carbs_per_100g: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Grasas (g)</label>
            <input type="number" step="0.1" value={formData.fat_per_100g} onChange={e => setFormData({ ...formData, fat_per_100g: e.target.value })} required />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>
          <Check size={16} style={{ marginRight: '0.4rem' }} />
          {mode === 'create' ? 'Guardar en Librería' : 'Actualizar'}
        </button>
        <button type="button" onClick={() => { setMode('list'); setEditingFood(null); }} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale" style={{ maxWidth: '600px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><BookOpen size={20} color="var(--primary)" /></div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              {mode === 'create' ? 'Nuevo Alimento' : mode === 'edit' ? `Editar: ${editingFood?.name}` : 'Librería de Alimentos'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {mode !== 'list' ? renderForm() : (
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
              <button onClick={startCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', whiteSpace: 'nowrap' }}>
                <Plus size={18} /> Nuevo
              </button>
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              {filteredLibrary.map(food => (
                <div key={food.id} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.emoji} {food.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{food.category} • {food.calories_per_100g} kcal/100g</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {food.user_id !== null && (
                      <>
                        <button
                          onClick={() => startEdit(food)}
                          title="Editar"
                          style={{ background: 'rgba(var(--primary-rgb),0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteFood(food.id)}
                          title="Eliminar"
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    {food.user_id === null && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.35, fontStyle: 'italic' }}>Base</span>
                    )}
                  </div>
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
  onEditFood: PropTypes.func.isRequired,
};
