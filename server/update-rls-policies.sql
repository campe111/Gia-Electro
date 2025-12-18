-- Actualizar políticas RLS para permitir que el admin vea todos los pedidos
-- Ejecutar este script en el SQL Editor de Supabase

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Admins pueden ver todas las órdenes" ON public.orders;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias órdenes" ON public.orders;

-- Permitir lectura pública de órdenes (para el admin dashboard)
-- En producción, esto debería estar más restringido
CREATE POLICY "Permitir lectura pública de órdenes"
  ON public.orders FOR SELECT
  USING (true);

-- Mantener la política de inserción
-- (Ya existe "Cualquiera puede crear órdenes")

-- Actualizar política de actualización para permitir a cualquiera actualizar
-- (Solo para desarrollo, en producción debería ser más restrictiva)
DROP POLICY IF EXISTS "Admins pueden actualizar órdenes" ON public.orders;

CREATE POLICY "Permitir actualización de órdenes"
  ON public.orders FOR UPDATE
  USING (true);

