-- Ejecutar en Supabase después de los esquemas existentes.
-- Las operaciones administrativas pasan exclusivamente por el backend
-- autenticado, que usa service_role y no depende de políticas permisivas.

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_admin_all" ON site_settings;
DROP POLICY IF EXISTS "blog_admin_all" ON blog_posts;
DROP POLICY IF EXISTS "messages_admin_all" ON contact_messages;
DROP POLICY IF EXISTS "analytics_events_insert" ON analytics_events;

-- Solo el contenido publicado del blog se puede consultar directamente.
DROP POLICY IF EXISTS "blog_public_read" ON blog_posts;
CREATE POLICY "blog_public_read"
ON blog_posts FOR SELECT
USING (is_published = true);

REVOKE ALL ON site_settings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON blog_posts FROM anon, authenticated;
REVOKE ALL ON contact_messages FROM anon, authenticated;
REVOKE ALL ON analytics_events FROM anon, authenticated;

-- Nunca conservar tokens privados de Mercado Pago en una tabla.
UPDATE site_settings SET mp_access_token = NULL WHERE mp_access_token IS NOT NULL;

SELECT 'Seguridad RLS MAKANGRU aplicada' AS resultado;
