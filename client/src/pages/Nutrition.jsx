import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { nutritionService } from '../services/nutritionService';
import NutritionHeader from '../components/nutrition/NutritionHeader';
import DailyFoodLog from '../components/nutrition/DailyFoodLog';
import WaterTracker from '../components/nutrition/WaterTracker';
import CaffeineTracker from '../components/nutrition/CaffeineTracker';
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
    settings: { calorie_goal: 2000, water_goal_ml: 1920, caffeine_limit_mg: 400 },
  });
  const [library, setLibrary] = useState([]);

  // Modals state
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

  const handleAddFoodClick = (mealType) => {
    setSelectedMealType(mealType);
    setShowAddFood(true);
  };

  const handleAddFood = async (foodData) => {
    try {
      const newLog = await nutritionService.logFood(foodData);
      setData(prev => ({ ...prev, food_logs: [newLog, ...prev.food_logs] }));
    } catch (err) {
      toast.error('Error al registrar alimento');
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await nutritionService.deleteLogFood(id);
      setData(prev => ({ ...prev, food_logs: prev.food_logs.filter(log => log.id !== id) }));
      toast.success('Alimento eliminado');
    } catch (err) {
      toast.error('Error al eliminar alimento');
    }
  };

  const handleCreateLibraryFood = async (foodData) => {
    const newFood = await nutritionService.createFood(foodData);
    setLibrary(prev => [...prev, newFood].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteLibraryFood = async (id) => {
    try {
      await nutritionService.deleteFood(id);
      setLibrary(prev => prev.filter(food => food.id !== id));
      toast.success('Alimento eliminado de la librería');
    } catch (err) {
      toast.error('Error al eliminar alimento');
    }
  };

  const handleLogWater = async (waterData) => {
    try {
      const newLog = await nutritionService.logWater(waterData);
      setData(prev => ({ ...prev, water_logs: [newLog, ...prev.water_logs] }));
    } catch (err) {
      toast.error('Error al registrar agua');
    }
  };

  const handleDeleteWater = async (id) => {
    try {
      await nutritionService.deleteWater(id);
      setData(prev => ({ ...prev, water_logs: prev.water_logs.filter(log => log.id !== id) }));
    } catch (err) {
      toast.error('Error al eliminar registro');
    }
  };

  const handleLogCaffeine = async (cafData) => {
    try {
      const newLog = await nutritionService.logCaffeine(cafData);
      setData(prev => ({ ...prev, caffeine_logs: [newLog, ...prev.caffeine_logs] }));
    } catch (err) {
      toast.error('Error al registrar cafeína');
    }
  };

  const handleDeleteCaffeine = async (id) => {
    try {
      await nutritionService.deleteCaffeine(id);
      setData(prev => ({ ...prev, caffeine_logs: prev.caffeine_logs.filter(log => log.id !== id) }));
    } catch (err) {
      toast.error('Error al eliminar registro');
    }
  };

  const handleSaveSettings = async (settingsData) => {
    try {
      const newSettings = await nutritionService.saveSettings(settingsData);
      setData(prev => ({ ...prev, settings: newSettings }));
      toast.success('Ajustes guardados');
      setShowSettings(false);
    } catch (err) {
      toast.error('Error al guardar ajustes');
    }
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
        <DailyFoodLog 
          logs={data.food_logs} 
          settings={data.settings} 
          onAddFoodClick={handleAddFoodClick} 
          onDeleteFood={handleDeleteFood} 
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <WaterTracker 
            logs={data.water_logs} 
            settings={data.settings} 
            onLogWater={handleLogWater} 
            onDeleteWater={handleDeleteWater} 
          />
          <CaffeineTracker 
            logs={data.caffeine_logs} 
            settings={data.settings} 
            onLogCaffeine={handleLogCaffeine} 
            onDeleteCaffeine={handleDeleteCaffeine} 
          />
        </div>

        <BmiCalculator />
      </div>

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
