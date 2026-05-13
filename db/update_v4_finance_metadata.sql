-- ============================================
-- STRIKE v4.0 — Metadata & Euro BCV
-- ============================================

CREATE TABLE IF NOT EXISTS app_metadata (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL
);

-- Configuración de tasas de cambio (incluyendo Euro BCV)
INSERT INTO app_metadata (id, data) VALUES
('rate_configs', '[
  { "key": "usd_bs", "label": "Dólar Paralelo", "suffix": "Bs", "emoji": "🇺🇸", "color": "#10b981", "autoFetch": true, "sublabel": "Monitor Dólar" },
  { "key": "usd_bs_bcv", "label": "Dólar BCV", "suffix": "Bs", "emoji": "🏛️", "color": "#3b82f6", "autoFetch": true, "sublabel": "Tasa Oficial" },
  { "key": "eur_bs_bcv", "label": "Euro BCV", "suffix": "Bs", "emoji": "🇪🇺", "color": "#f59e0b", "autoFetch": true, "sublabel": "Tasa Oficial" },
  { "key": "usd_cop", "label": "Peso Colombiano", "suffix": "COP", "emoji": "🇨🇴", "color": "#fbbf24", "optional": true, "sublabel": "1 USD = X COP" },
  { "key": "usdt_bs", "label": "USDT Binance", "suffix": "Bs", "emoji": "🪙", "color": "#f59e0b", "optional": true, "sublabel": "P2P Promedio" }
]')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- Monedas soportadas en la app
INSERT INTO app_metadata (id, data) VALUES
('currencies', '[
  { "id": "USD", "symbol": "$", "name": "Dólar USD", "emoji": "💵" },
  { "id": "BS", "symbol": "Bs", "name": "Bolívar", "emoji": "🇻🇪" },
  { "id": "COP", "symbol": "$", "name": "Peso COP", "emoji": "🇨🇴" },
  { "id": "EUR", "symbol": "€", "name": "Euro", "emoji": "💶" },
  { "id": "USDT", "symbol": "₮", "name": "USDT", "emoji": "🪙" }
]')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- Categorías financieras globales
INSERT INTO app_metadata (id, data) VALUES
('finance_categories', '[
  { "id": "Alimentación", "emoji": "🛒", "color": "#10b981", "type": "expense" },
  { "id": "Transporte", "emoji": "🚌", "color": "#3b82f6", "type": "expense" },
  { "id": "Vivienda", "emoji": "🏠", "color": "#f59e0b", "type": "expense" },
  { "id": "Salud", "emoji": "💊", "color": "#ef4444", "type": "expense" },
  { "id": "Ocio", "emoji": "🍿", "color": "#8b5cf6", "type": "expense" },
  { "id": "Educación", "emoji": "📚", "color": "#06b6d4", "type": "expense" },
  { "id": "Compras", "emoji": "🛍️", "color": "#ec4899", "type": "expense" },
  { "id": "Ahorro", "emoji": "🐷", "color": "#14b8a6", "type": "expense" },
  { "id": "Inversión", "emoji": "📈", "color": "#6366f1", "type": "expense" },
  { "id": "Salario", "emoji": "💰", "color": "#10b981", "type": "income" },
  { "id": "Negocios", "emoji": "💼", "color": "#3b82f6", "type": "income" },
  { "id": "Ventas", "emoji": "🏷️", "color": "#f59e0b", "type": "income" },
  { "id": "Regalos", "emoji": "🎁", "color": "#ec4899", "type": "income" },
  { "id": "Otros", "emoji": "✨", "color": "#9ca3af", "type": "both" }
]')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
