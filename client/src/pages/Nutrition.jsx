import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { nutritionService } from '../services/nutritionService';
import NutritionHeader from '../components/nutrition/NutritionHeader';
import DailyFoodLog from '../components/nutrition/DailyFoodLog';
import WaterTracker from '../components/nutrition/WaterTracker';
import CaffeineTracker from '../components/nutrition/CaffeineTracker';
import SugarTracker from '../components/nutrition/SugarTracker';
import NutritionHistory from '../components/nutrition/NutritionHistory';
import BmiCalculator from '../components/nutrition/BmiCalculator';
import AddFoodModal from '../components/nutrition/modals/AddFoodModal';
import FoodLibraryModal from '../components/nutrition/modals/FoodLibraryModal';
import NutritionSettingsModal from '../components/nutrition/modals/NutritionSettingsModal';

export default function Nutrition() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    food_logs: [],
    water_logs: [],
    caffeine_logs: [],
    sugar_logs: [],
    settings: { calorie_goal: 2000, water_goal_ml: 1920, caffeine_limit_mg: 400, sugar_limit_g: 50 },
  });
  const [library, setLibrary] = useState([]);

  const [showAddFood, setShowAddFood] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('snack');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dailyRes, libRes] = await Promise.all([
        nutritionService.getDailyData(),
        nutritionService.getLibrary()
      ]);
      setData(dailyRes);
      setLibrary(libRes);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos de nutrición');
    } finally {
      setLoading(false);
    }
  };

  // --- Food Logs ---
  const handleAddFoodClick = (mealType) => { setSelectedMealType(mealType); setShowAddFood(true); };
  const handleAddFood = async (foodData) => {
    try {
      const newLog = await nutritionService.logFood(foodData);
      setData(prev => ({ ...prev, food_logs: [newLog, ...prev.food_logs] }));
    } catch { toast.error('Error al registrar alimento'); }
  };
  const handleDeleteFood = async (id) => {
    try {
      await nutritionService.deleteLogFood(id);
      setData(prev => ({ ...prev, food_logs: prev.food_logs.filter(l => l.id !== id) }));
      toast.success('Alimento eliminado');
    } catch { toast.error('Error al eliminar alimento'); }
  };

  // --- Library ---
  const handleCreateLibraryFood = async (foodData) => {
    const newFood = await nutritionService.createFood(foodData);
    setLibrary(prev => [...prev, newFood].sort((a, b) => a.name.localeCompare(b.name)));
  };
  const handleDeleteLibraryFood = async (id) => {
    try {
      await nutritionService.deleteFood(id);
      setLibrary(prev => prev.filter(food => food.id !== id));
      toast.success('Alimento eliminado de la librería');
    } catch { toast.error('Error al eliminar alimento'); }
  };
  const handleEditLibraryFood = async (id, foodData) => {
    const updated = await nutritionService.editFood(id, foodData);
    setLibrary(prev => prev.map(f => f.id === id ? updated : f).sort((a, b) => a.name.localeCompare(b.name)));
  };

  // --- Water ---
  const handleLogWater = async (waterData) => {
    try {
      const newLog = await nutritionService.logWater(waterData);
      setData(prev => ({ ...prev, water_logs: [newLog, ...prev.water_logs] }));
    } catch { toast.error('Error al registrar agua'); }
  };
  const handleDeleteWater = async (id) => {
    try {
      await nutritionService.deleteWater(id);
      setData(prev => ({ ...prev, water_logs: prev.water_logs.filter(l => l.id !== id) }));
    } catch { toast.error('Error al eliminar registro'); }
  };

  // --- Caffeine ---
  const handleLogCaffeine = async (cafData) => {
    try {
      const newLog = await nutritionService.logCaffeine(cafData);
      setData(prev => ({ ...prev, caffeine_logs: [newLog, ...prev.caffeine_logs] }));
    } catch { toast.error('Error al registrar cafeína'); }
  };
  const handleDeleteCaffeine = async (id) => {
    try {
      await nutritionService.deleteCaffeine(id);
      setData(prev => ({ ...prev, caffeine_logs: prev.caffeine_logs.filter(l => l.id !== id) }));
    } catch { toast.error('Error al eliminar registro'); }
  };

  // --- Sugar ---
  const handleLogSugar = async (sugarData) => {
    try {
      const newLog = await nutritionService.logSugar(sugarData);
      setData(prev => ({ ...prev, sugar_logs: [newLog, ...prev.sugar_logs] }));
    } catch { toast.error('Error al registrar azúcar'); }
  };
  const handleDeleteSugar = async (id) => {
    try {
      await nutritionService.deleteSugar(id);
      setData(prev => ({ ...prev, sugar_logs: prev.sugar_logs.filter(l => l.id !== id) }));
    } catch { toast.error('Error al eliminar registro'); }
  };

  // --- Settings ---
  const handleSaveSettings = async (settingsData) => {
    try {
      const newSettings = await nutritionService.saveSettings(settingsData);
      setData(prev => ({ ...prev, settings: newSettings }));
      toast.success('Ajustes guardados');
      setShowSettings(false);
    } catch { toast.error('Error al guardar ajustes'); }
  };

  if (loading) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Cargando Nutrición...</h2></div>;
  }

  return (
    <div className="app-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <NutritionHeader onSettingsClick={() => setShowSettings(true)} />

      <button
        onClick={() => setShowLibrary(true)}
        style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontWeight: 700 }}
      >
        <BookOpen size={20} color="var(--primary)" /> Gestionar Librería de Alimentos
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Daily food log */}
        <DailyFoodLog
          logs={data.food_logs}
          settings={data.settings}
          onAddFoodClick={handleAddFoodClick}
          onDeleteFood={handleDeleteFood}
        />

        {/* Water, Caffeine, Sugar trackers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <WaterTracker logs={data.water_logs} settings={data.settings} onLogWater={handleLogWater} onDeleteWater={handleDeleteWater} />
          <CaffeineTracker logs={data.caffeine_logs} settings={data.settings} onLogCaffeine={handleLogCaffeine} onDeleteCaffeine={handleDeleteCaffeine} />
          <SugarTracker logs={data.sugar_logs} settings={data.settings} onLogSugar={handleLogSugar} onDeleteSugar={handleDeleteSugar} />
        </div>

        {/* BMI */}
        <BmiCalculator />

        {/* Historical summary at the bottom */}
        <NutritionHistory settings={data.settings} />
      </div>

      {/* Modals */}
      <AddFoodModal
        show={showAddFood}
        onClose={() => setShowAddFood(false)}
        library={library}
        mealType={selectedMealType}
        onAddFood={handleAddFood}
      />
      <FoodLibraryModal
        show={showLibrary}
        onClose={() => setShowLibrary(false)}
        library={library}
        onCreateFood={handleCreateLibraryFood}
        onDeleteFood={handleDeleteLibraryFood}
        onEditFood={handleEditLibraryFood}
      />
      <NutritionSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={data.settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
