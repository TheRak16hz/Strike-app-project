import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function TransactionFormModal({ 
  show, 
  onClose, 
  onSubmit, 
  editingItem, 
  newTrans, 
  setNewTrans, 
  goals,
  categories = [],
  currencies = [],
  forcedType = null,
  forcedGoalId = null
}) {

  // Auto-set values based on forced context or when type changes
  useEffect(() => {
    if (show) {
      let updates = {};
      if (forcedType) {
        updates.type = forcedType;
      }
      if (forcedGoalId) {
        updates.goal_id = forcedGoalId;
      }

      // Default categories based on type
      const currentType = forcedType || newTrans.type;
      if (currentType === 'saving') {
        updates.category = 'Ahorro';
      } else if (currentType === 'goal_withdrawal') {
        updates.category = 'Retiro de Meta';
      }

      if (Object.keys(updates).length > 0) {
        setNewTrans(prev => ({ ...prev, ...updates }));
      }
    }
  }, [show, forcedType, forcedGoalId, newTrans.type]);

  if (!show) return null;

  const handleTypeChange = (type) => {
    let category = newTrans.category;
    if (type === 'saving') {
      category = 'Ahorro';
    } else if (type === 'goal_withdrawal') {
      category = 'Retiro de Meta';
    } else {
      // Find first valid category for this new type
      const filtered = categories.filter(c => c.type === type || c.type === 'both');
      if (filtered.length > 0) {
        category = filtered[0].label || filtered[0].id;
      }
    }

    setNewTrans({ ...newTrans, type, category });
  };

  const handleCategorySelect = (cat) => {
    setNewTrans({ ...newTrans, category: cat.label || cat.id });
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => {
    if (newTrans.type === 'income') {
      return cat.type === 'income' || cat.type === 'both';
    }
    if (newTrans.type === 'expense') {
      return cat.type === 'expense' || cat.type === 'both';
    }
    return false; // For 'saving' and 'goal_withdrawal' we hide the category grid
  });

  const showCategories = newTrans.type === 'income' || newTrans.type === 'expense';
  const isGoalRequired = newTrans.type === 'saving' || newTrans.type === 'goal_withdrawal';

  // UI labels based on forced modes
  let modalTitle = editingItem ? 'Editar Movimiento' : 'Nuevo Movimiento';
  if (forcedType === 'saving') modalTitle = 'Añadir Fondos a Meta';
  if (forcedType === 'goal_withdrawal') modalTitle = 'Retirar Fondos de Meta';

  return (
    <div className="modal-overlay">
      <form className="modal-content animate-scale" style={{ maxWidth: '520px' }} onSubmit={onSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{modalTitle}</h2>
          <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0, padding: 0, margin: 0 }}>
             <X size={18} style={{ display: 'block' }} />
          </button>
        </div>
        
        {/* Only show type selector if not forced */}
        {!forcedType && (
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '16px' }}>
            {[
              { id: 'income', label: 'Ingreso', color: '#10b981' },
              { id: 'saving', label: 'Ahorro', color: 'var(--primary)' },
              { id: 'expense', label: 'Egreso', color: '#ef4444' }
            ].map(opt => (
              <button key={opt.id} type="button" onClick={() => handleTypeChange(opt.id)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: newTrans.type === opt.id ? opt.color : 'transparent', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
           <div className="form-group" style={{ minWidth: 0 }}>
             <label>Monto</label>
             <input type="number" value={newTrans.amount} onChange={e => setNewTrans({...newTrans, amount: e.target.value})} step="0.01" required style={{ width: '100%', boxSizing: 'border-box' }} />
           </div>
           <div className="form-group" style={{ minWidth: 0 }}>
             <label>Divisa</label>
             <select value={newTrans.currency} onChange={e => setNewTrans({...newTrans, currency: e.target.value})} style={{ width: '100%', boxSizing: 'border-box' }}>
               {currencies && currencies.length > 0 ? (
                 currencies.map(c => <option key={c.value} value={c.value}>{c.emoji || ''} {c.label || c.name}</option>)
               ) : (
                 <>
                   <option value="USD">🇺🇸 USD</option>
                   <option value="USDT">🟢 USDT</option>
                   <option value="BS_P">🇻🇪 Bs (Paralelo)</option>
                   <option value="BS_BCV">🏛️ Bs (BCV)</option>
                   <option value="COP">🇨🇴 COP</option>
                   <option value="EUR">🇪🇺 EUR</option>
                 </>
               )}
             </select>
           </div>
        </div>

        {showCategories && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Categoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              {filteredCategories.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => handleCategorySelect(cat)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.5rem',
                    borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
                    background: newTrans.category === (cat.label || cat.id) ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    border: `1px solid ${newTrans.category === (cat.label || cat.id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cat.icon || cat.emoji}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{cat.label || cat.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label>Origen / Fuente</label>
            <input type="text" value={newTrans.source} onChange={e => setNewTrans({...newTrans, source: e.target.value})} placeholder="Ej: Efectivo, Banco..." style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label>Fecha</label>
            <input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* If goals is required or not forced to a single goal */}
        {!forcedGoalId && isGoalRequired && (
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>{isGoalRequired ? 'Meta Asociada (Obligatoria)' : 'Meta Asociada (Opcional)'}</label>
            <select 
              value={newTrans.goal_id || ''} 
              onChange={e => setNewTrans({...newTrans, goal_id: e.target.value || null})}
              required={isGoalRequired}
            >
              <option value="">{isGoalRequired ? '-- Selecciona una meta --' : 'Ninguna'}</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
            {isGoalRequired && goals.length === 0 && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>
                ⚠ Debes crear una meta en la sección de Metas antes de poder registrar un ahorro.
              </p>
            )}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isGoalRequired && goals.length === 0}
          style={{ 
            width: '100%', 
            padding: '1.2rem', 
            background: newTrans.type === 'income' ? '#10b981' : (newTrans.type === 'expense' ? '#ef4444' : 'var(--primary)'),
            cursor: (isGoalRequired && goals.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isGoalRequired && goals.length === 0) ? 0.5 : 1
          }}
        >
          {editingItem ? 'Actualizar' : 'Confirmar'}
        </button>
      </form>
    </div>
  );
}

TransactionFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingItem: PropTypes.object,
  newTrans: PropTypes.shape({
    type: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    category: PropTypes.string,
    source: PropTypes.string,
    date: PropTypes.string,
    goal_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setNewTrans: PropTypes.func.isRequired,
  goals: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  categories: PropTypes.array,
  currencies: PropTypes.array,
  forcedType: PropTypes.string,
  forcedGoalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
