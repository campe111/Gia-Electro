-- Crear tabla de órdenes
create table public.orders (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_data jsonb not null,
  shipping_data jsonb not null,
  items jsonb not null,
  total numeric not null,
  status text default 'pending'::text,
  payment_status text default 'pending'::text,
  payment_data jsonb,
  shipping_status text default 'pending'::text,
  tracking_number text,
  user_id uuid references auth.users(id)
);

-- Habilitar RLS
alter table public.orders enable row level security;

-- Políticas de seguridad
-- Permitir a cualquiera crear una orden (para usuarios no registrados o checkout público)
create policy "Cualquiera puede crear órdenes"
  on public.orders for insert
  with check (true);

-- Permitir a usuarios ver sus propias órdenes
create policy "Usuarios pueden ver sus propias órdenes"
  on public.orders for select
  using (auth.uid() = user_id);

-- Permitir a administradores ver todas las órdenes
-- Nota: Esto asume que tienes una forma de identificar admins, por ahora usaremos una política simple
-- En producción deberías tener una tabla de roles o claims en el token
create policy "Admins pueden ver todas las órdenes"
  on public.orders for select
  using (auth.email() = 'admin@giaelectro.com');

-- Permitir a administradores actualizar órdenes
create policy "Admins pueden actualizar órdenes"
  on public.orders for update
  using (auth.email() = 'admin@giaelectro.com');
