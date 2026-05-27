import { useState, useEffect } from 'react';
import { Moon, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { sleepService } from '../services/sleepService';
import SleepLogForm from '../components/sleep/SleepLogForm';
import SleepStats from '../components/sleep/SleepStats';
import SleepSettingsModal from '../components/sleep/modals/SleepSettingsModal';

export default function Sleep() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    logs: [],
    settings: { target_hours: 8, bedtime_goal: '23:00', wakeup_goal: '07:00' },
    stats: { avg_weekly: 0, avg_monthly: 0, avg_quality: 0, healthy_streak: 0, total_logs: 0 }
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await sleepService.getSleepData();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos de sueño');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSleep = async (sleepData) => {
    try {
      await sleepService.logSleep(sleepData);
      loadData(); // Reload to get updated stats
    } catch (err) {
      toast.error('Error al registrar sueño');
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        await sleepService.deleteSleepLog(id);
        toast.success('Registro eliminado');
        loadData();
      } catch (err) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEditLog = async (id, updatedData) => {
    try {
      await sleepService.updateSleepLog(id, updatedData);
      toast.success('Registro actualizado');
      loadData();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleSaveSettings = async (settingsData) => {
    try {
      const newSettings = await sleepService.saveSettings(settingsData);
      setData(prev => ({ ...prev, settings: newSettings }));
      toast.success('Ajustes guardados');
      setShowSettings(false);
      loadData(); // Reload stats if goal changed
    } catch (err) {
      toast.error('Error al guardar ajustes');
    }
  };

  if (loading) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Cargando Sueño...</h2></div>;
  }

  const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
            <Moon size={24} color="#8b5cf6" />
            {date}
          </h2>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Tu resumen de descanso</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <Settings size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SleepLogForm onLogSleep={handleLogSleep} />
        <SleepStats 
          stats={data.stats} 
          settings={data.settings} 
          logs={data.logs} 
          onDelete={handleDeleteLog} 
          onEdit={handleEditLog} 
        />
      </div>

      <SleepSettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={data.settings} 
        onSave={handleSaveSettings} 
      />
    </div>
  );
}
