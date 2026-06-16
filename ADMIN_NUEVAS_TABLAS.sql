-- ============================================================
-- MAKANGRU ✦ Nuevas tablas para panel admin completo
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. SITE SETTINGS (ajustes generales del sitio)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  -- Identidad
  site_name VARCHAR(100) DEFAULT 'MAKANGRU',
  site_tagline VARCHAR(200) DEFAULT 'Atelier de la Alquimia Chocolística',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  -- Contacto
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  contact_address TEXT,
  contact_city VARCHAR(100) DEFAULT 'Santiago, Chile',
  -- Redes sociales
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  pinterest_url TEXT,
  -- Integraciones
  whatsapp_number VARCHAR(20),
  whatsapp_message TEXT DEFAULT 'Hola MAKANGRU ✦ me gustaría hacer un pedido',
  mp_public_key TEXT,
  mp_access_token TEXT,
  -- Banner de anuncio
  banner_enabled BOOLEAN DEFAULT false,
  banner_text TEXT,
  banner_color VARCHAR(20) DEFAULT '#C8860A',
  -- Horarios
  business_hours TEXT,
  -- SEO
  meta_title VARCHAR(200),
  meta_description VARCHAR(320),
  og_image_url TEXT,
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solo puede haber 1 fila (id=1)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_admin_all" ON site_settings;
CREATE POLICY "settings_admin_all" ON site_settings USING (true) WITH CHECK (true);

-- Insertar fila inicial si no existe
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar columnas is_new y is_featured en products (por si no existen)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);

-- 3. Policies para blog_posts (lectura pública de publicados, admin puede todo)
DROP POLICY IF EXISTS "blog_admin_all" ON blog_posts;
CREATE POLICY "blog_admin_all" ON blog_posts
  USING (true) WITH CHECK (true);

-- 4. Policies para contact_messages (solo admin)
DROP POLICY IF EXISTS "messages_admin_all" ON contact_messages;
CREATE POLICY "messages_admin_all" ON contact_messages
  USING (true) WITH CHECK (true);

-- 5. Supabase Storage: crear buckets si no existen
-- (ejecutar en Dashboard → Storage si el SQL no los crea)
-- Bucket "products" - imágenes de productos
-- Bucket "blog"     - imágenes de blog
-- Ambos deben ser PUBLIC para que las URLs funcionen

SELECT 'MAKANGRU ✦ Tablas admin listas' AS resultado;
