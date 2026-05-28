-- ============================================
-- STRIKE v8.0 — USDT support & categories clean split
-- ============================================

-- Monedas actualizadas incluyendo USDT por separado
INSERT INTO app_metadata (id, data) VALUES
('currencies', '[
  { "id": "USD", "value": "USD", "symbol": "$", "name": "Dólar Efectivo", "label": "💵 USD Efectivo", "emoji": "💵" },
  { "id": "USDT", "value": "USDT", "symbol": "$", "name": "USDT Digital", "label": "🟢 USDT Digital", "emoji": "🪙" },
  { "id": "BS_P", "value": "BS_P", "symbol": "Bs", "name": "Bolívar Paralelo", "label": "🇻🇪 Bs Paralelo", "emoji": "🇻🇪" },
  { "id": "BS_BCV", "value": "BS_BCV", "symbol": "Bs", "name": "Bolívar BCV", "label": "🏛️ Bs BCV", "emoji": "🏛️" },
  { "id": "COP", "value": "COP", "symbol": "$", "name": "Peso COP", "label": "🇨🇴 COP ($)", "emoji": "🇨🇴" },
  { "id": "EUR", "value": "EUR", "symbol": "€", "name": "Euro BCV", "label": "🇪🇺 Euro BCV (€)", "emoji": "💶" }
]')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- Categorías financieras actualizadas
INSERT INTO app_metadata (id, data) VALUES
('finance_categories', '[
  { "id": "Alimentación", "emoji": "🛒", "color": "#10b981", "type": "expense" },
  { "id": "Transporte", "emoji": "🚌", "color": "#3b82f6", "type": "expense" },
  { "id": "Vivienda", "emoji": "🏠", "color": "#f59e0b", "type": "expense" },
  { "id": "Salud", "emoji": "💊", "color": "#ef4444", "type": "expense" },
  { "id": "Ocio", "emoji": "🍿", "color": "#8b5cf6", "type": "expense" },
  { "id": "Educación", "emoji": "📚", "color": "#06b6d4", "type": "expense" },
  { "id": "Compras", "emoji": "🛍️", "color": "#ec4899", "type": "expense" },
  { "id": "Inversión", "emoji": "📈", "color": "#6366f1", "type": "expense" },
  { "id": "Ahorro", "emoji": "🐷", "color": "#14b8a6", "type": "income" },
  { "id": "Salario", "emoji": "💰", "color": "#10b981", "type": "income" },
  { "id": "Negocios", "emoji": "💼", "color": "#3b82f6", "type": "income" },
  { "id": "Ventas", "emoji": "🏷️", "color": "#f59e0b", "type": "income" },
  { "id": "Regalos", "emoji": "🎁", "color": "#ec4899", "type": "income" },
  { "id": "Otros", "emoji": "✨", "color": "#9ca3af", "type": "both" }
]')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
