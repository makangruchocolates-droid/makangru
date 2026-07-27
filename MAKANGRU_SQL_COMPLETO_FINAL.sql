
-- ============================================================
-- LOGIN ADMIN + TRANSFERENCIA BANCARIA
-- ============================================================

-- Método de pago en orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'mercadopago';

-- Campos de transferencia bancaria en site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_bank_name VARCHAR(100);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_account_type VARCHAR(50);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_account_holder VARCHAR(200);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_account_rut VARCHAR(20);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_account_number VARCHAR(50);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_email VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_instructions TEXT;

SELECT 'Login admin + transferencia bancaria listos' AS resultado;

-- ============================================================
-- ANALYTICS / MARKETING — eventos de GA4 + Meta Pixel
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(80) NOT NULL,
  event_params JSONB DEFAULT '{}',
  page_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (lo hace el navegador del cliente al navegar el sitio,
-- sin sesión de admin), pero nadie puede leer directo desde el cliente —
-- solo el service role (usado por /api/admin/*) puede consultar los datos.
DROP POLICY IF EXISTS "analytics_events_insert" ON analytics_events;
CREATE POLICY "analytics_events_insert" ON analytics_events FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

-- Housekeeping opcional: borrar eventos de más de 90 días para no acumular basura.
-- (Ejecútalo manualmente de vez en cuando, o prográmalo como cron en Supabase)
-- DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';

SELECT 'Analytics events listos' AS resultado;
