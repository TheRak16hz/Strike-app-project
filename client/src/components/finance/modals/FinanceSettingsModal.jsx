import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, RefreshCcw, Calculator, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FinanceSettingsModal({ show, onClose, rates, budgets, onSave, categories = [] }) {
  const [localRates, setLocalRates] = useState({...rates});
  const [localBudgets, setLocalBudgets] = useState({...budgets});
  const [calc, setCalc] = useState({ amount: '', from: 'BS_P', to: 'USD', result: '0.00' });

  useEffect(() => {
    if (show) {
      setLocalRates({...rates});
      setLocalBudgets({...budgets});
    }
  }, [show, rates, budgets]);

  // Se usan las categorías de presupuestos (tipo expense/both) recibidas dinámicamente

  const handleCalc = (amount, from, to) => {
    if (!amount || isNaN(amount)) return '0.00';
    const val = Number(amount);
    const usd_bs = Number(rates.usd_bs || 648);
    const usd_bscv = Number(rates.usd_bs_bcv || 474);
    const eur_bscv = Number(rates.eur_bs_bcv || 570);
    const usd_cop = Number(rates.usd_cop || 4200);
    const bs_cop = Number(rates.bs_cop || 5);

    let usdValue = 0;
    if (from === 'USD' || from === 'USDT') usdValue = val;
    else if (from === 'EUR') usdValue = val * (eur_bscv / usd_bscv);
    else if (from === 'BS_P') usdValue = val / usd_bs;
    else if (from === 'BS_BCV') usdValue = val / usd_bscv;
    else if (from === 'COP') usdValue = val / usd_cop;
    
    // Direct cross-rate conversion
    if (from === 'BS_P' && to === 'COP') return (val * bs_cop).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (from === 'COP' && to === 'BS_P') return (val / bs_cop).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (from === 'EUR' && to === 'BS_BCV') return (val * eur_bscv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (from === 'BS_BCV' && to === 'EUR') return (val / eur_bscv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let result = 0;
    if (to === 'USD' || to === 'USDT') result = usdValue;
    else if (to === 'EUR') result = usdValue * (usd_bscv / eur_bscv);
    else if (to === 'BS_P') result = usdValue * usd_bs;
    else if (to === 'BS_BCV') result = usdValue * usd_bscv;
    else if (to === 'COP') result = usdValue * usd_cop;
    
    return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px' }}><RefreshCcw size={20} color="var(--primary)" /></div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Ajustes Financieros</h2>
           </div>
           <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0, padding: 0, margin: 0 }}>
              <X size={18} style={{ display: 'block' }} />
           </button>
        </div>

        {/* --- EXCHAGE RATES --- */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Tasas de Cambio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ minWidth: 0 }}>
               <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>USD/BS (Paralelo)</label>
               <input type="number" value={localRates.usd_bs} onChange={e => setLocalRates({...localRates, usd_bs: e.target.value})} step="0.01" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div className="form-group" style={{ minWidth: 0 }}>
               <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>USD/BS (BCV)</label>
               <input type="number" value={localRates.usd_bs_bcv} onChange={e => setLocalRates({...localRates, usd_bs_bcv: e.target.value})} step="0.01" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div className="form-group" style={{ minWidth: 0 }}>
               <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>EUR/BS (Euro BCV)</label>
               <input type="number" value={localRates.eur_bs_bcv || 570} onChange={e => setLocalRates({...localRates, eur_bs_bcv: e.target.value})} step="0.01" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
             <div className="form-group" style={{ minWidth: 0 }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>USD/COP (Pesos)</label>
                <input type="number" value={localRates.usd_cop} onChange={e => setLocalRates({...localRates, usd_cop: e.target.value})} step="1" style={{ width: '100%', boxSizing: 'border-box' }} />
             </div>
             <div className="form-group" style={{ minWidth: 0 }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>BS/COP (Pesos por 1 BS)</label>
                <input type="number" value={localRates.bs_cop} onChange={e => setLocalRates({...localRates, bs_cop: e.target.value})} step="0.1" style={{ width: '100%', boxSizing: 'border-box' }} />
             </div>
          </div>
        </section>

        {/* --- CONVERSION CALCULATOR --- */}
        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calculator size={16} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Calculadora Rápida</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                placeholder="Monto" 
                value={calc.amount}
                onChange={e => setCalc({ ...calc, amount: e.target.value, result: handleCalc(e.target.value, calc.from, calc.to) })}
                style={{ flex: 1, padding: '0.6rem' }}
              />
              <select 
                value={calc.from} 
                onChange={e => setCalc({ ...calc, from: e.target.value, result: handleCalc(calc.amount, e.target.value, calc.to) })}
                style={{ width: '90px', padding: '0.6rem' }}
              >
                <option value="USD">🇺🇸 USD</option>
                <option value="BS_P">🇻🇪 BS (P)</option>
                <option value="BS_BCV">🏛️ BS (BCV)</option>
                <option value="COP">🇨🇴 COP</option>
                <option value="EUR">🇪🇺 EUR</option>
              </select>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.8rem' }}>↓</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                {calc.result}
              </div>
              <select 
                value={calc.to} 
                onChange={e => setCalc({ ...calc, to: e.target.value, result: handleCalc(calc.amount, calc.from, e.target.value) })}
                style={{ width: '90px', padding: '0.6rem' }}
              >
                <option value="USD">🇺🇸 USD</option>
                <option value="BS_P">🇻🇪 BS (P)</option>
                <option value="BS_BCV">🏛️ BS (BCV)</option>
                <option value="COP">🇨🇴 COP</option>
                <option value="EUR">🇪🇺 EUR</option>
              </select>
            </div>
          </div>
        </section>

        {/* --- BUDGETS --- */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <TrendingUp size={16} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Presupuestos ($ USD)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {categories.map(catObj => {
              const cat = catObj.id;
              return (
                <div key={cat} className="form-group" style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>{catObj.emoji || ''} {cat}</label>
                  <input 
                    type="number" 
                    value={localBudgets[cat] || ''} 
                    onChange={e => setLocalBudgets({...localBudgets, [cat]: e.target.value})} 
                    placeholder="Sin límite"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Zona de Peligro
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Hard Reset Financiero</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Elimina todas las transacciones y presupuestos permanentemente.</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                if (window.confirm('¿ESTÁS SEGURO? Se borrará todo tu historial financiero.')) {
                   toast.error('Funcionalidad en desarrollo para API de finanzas');
                }
              }} 
              className="btn-primary" 
              style={{ background: 'var(--danger)', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={18} /> Borrar Todo el Historial
            </button>
          </div>
        </section>

        <button 
          onClick={() => onSave({ exchange_rates: localRates, budgets: localBudgets })} 
          className="btn-primary" 
          style={{ width: '100%', padding: '1rem', height: 'auto', fontWeight: 800 }}
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}

FinanceSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rates: PropTypes.object.isRequired,
  budgets: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  categories: PropTypes.array
};
