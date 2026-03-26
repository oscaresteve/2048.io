# 2048 Adventure

![2048-adventure](https://github.com/user-attachments/assets/b4140ef2-5f16-4442-a5f3-cbdc9593698a)

Proyecto del 1er trimestre de DWEC (Desarrollo Web en Entorno Cliente) de 2º de DAW.

Aplicación web del juego 2048 con:

- Registro e inicio de sesión.
- Persistencia de partida en Supabase.
- Ranking global por puntuación máxima.
- Perfil de usuario con nickname y avatar.

## Tecnologías

- Vite
- JavaScript (ES Modules)
- RxJS (estado global reactivo)
- Tailwind CSS
- Supabase (Auth, PostgREST y Storage)
- Vitest (tests unitarios)

## Estructura del proyecto

```text
src/
  components/      # Lógica del juego (movimientos, grid, estado)
  routes/          # Router básico
  services/        # Auth, usuario, ranking, guardado de partida
  views/           # Vistas de login, registro y juego
test/              # Tests unitarios
```

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Proyecto de Supabase

## Instalación y ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno en un archivo `.env` (puedes partir de `.env.example`):

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

Para este proyecto, tu referencia de instancia es:

- Dashboard: `https://supabase.com/dashboard/project/ypfxbsnqfpdkwzrhmkoa`
- API URL (la que va en `VITE_SUPABASE_URL`): `https://ypfxbsnqfpdkwzrhmkoa.supabase.co`

3. Lanzar entorno de desarrollo:

```bash
npm run dev
```

4. Ejecutar tests:

```bash
npm run test
```

## Scripts disponibles

- `npm run dev`: inicia Vite en desarrollo.
- `npm run build`: genera build de producción.
- `npm run preview`: previsualiza el build.
- `npm run test`: ejecuta tests con Vitest.

## Backend en Supabase (cómo replicarlo)

La app usa tres servicios de Supabase:

- Auth: registro/login por email y contraseña.
- Base de datos (tabla `public.users`): perfil y progreso del juego.
- Storage (bucket `avatars`): imágenes de perfil.

### 1) Crear proyecto en Supabase

1. Crea un nuevo proyecto en Supabase.
2. Copia:
   - Project URL
   - anon public key
3. Añádelos al archivo `.env` con prefijos `VITE_`.

En tu caso:

- `VITE_SUPABASE_URL=https://ypfxbsnqfpdkwzrhmkoa.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<tu anon key>`

### 2) Crear tabla `users`

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
create table if not exists public.users (
  email text primary key,
  nickname text not null default 'Player',
  max_score integer not null default 0,
  game jsonb,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
```

### 3) Políticas RLS recomendadas

Estas políticas están pensadas para el comportamiento actual del código:

- Ranking global: lectura pública de `email`, `nickname`, `max_score`.
- Usuario autenticado: insertar y actualizar su propia fila por email.
- Lectura autenticada de su propio perfil.

```sql
-- Lectura pública (necesaria para ranking global con anon key)
create policy "public can read ranking"
on public.users
for select
to anon, authenticated
using (true);

-- Insertar su propia fila
create policy "authenticated can insert own user row"
on public.users
for insert
to authenticated
with check (email = auth.jwt() ->> 'email');

-- Actualizar su propia fila
create policy "authenticated can update own row"
on public.users
for update
to authenticated
using (email = auth.jwt() ->> 'email')
with check (email = auth.jwt() ->> 'email');
```

Nota: si prefieres restringir aún más el ranking, puede hacerse mediante una vista o función RPC específica.

### 4) Crear bucket de Storage para avatares

1. En Storage, crea un bucket llamado `avatars`.
2. Recomendado: bucket privado (la app usa signed URLs para mostrar avatar).
3. Ruta de archivo que usa la app:
   - `avatars/<email_sin_@_ni_puntos>/profile.png`

### 5) Políticas de Storage (base)

La app sube y firma archivos autenticando con token de usuario.

Ejemplo de políticas mínimas:

```sql
-- Permite a usuarios autenticados subir avatar al bucket avatars
create policy "authenticated can upload avatars"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars');

-- Permite a usuarios autenticados reemplazar/actualizar su avatar
create policy "authenticated can update avatars"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

-- Permite obtener signed URLs (lectura autenticada de objetos en avatars)
create policy "authenticated can read avatars"
on storage.objects
for select
to authenticated
using (bucket_id = 'avatars');
```

Si quieres una restricción estricta por usuario/carpeta, hay que ajustar políticas con la ruta del objeto.

### 6) Auth (confirmación por email)

Para este proyecto tienes activada la confirmación por email, por lo que el flujo esperado es:

1. Registro desde la app.
2. Confirmación en correo.
3. Inicio de sesión.

Si un usuario no confirma correo, el login puede fallar aunque el registro haya sido correcto.

### 7) Datos iniciales (opcional)

Si quieres cargar datos de ejemplo para validar ranking, puedes usar:

```sql
insert into public.users (email, nickname, max_score, game)
values
  ('ana@example.com', 'Ana', 1280, null),
  ('luis@example.com', 'Luis', 980, null),
  ('marta@example.com', 'Marta', 1560, null)
on conflict (email) do nothing;
```

### 8) Checklist de verificación rápida

1. Registro: crea cuenta y confirma email.
2. Login: accede con la cuenta confirmada.
3. Inserción en `users`: tras login existe fila con tu email.
4. Guardado de partida: al mover fichas cambia `game` y `max_score`.
5. Ranking: aparece ordenado por `max_score` descendente.
6. Avatar: subida correcta y visualización con signed URL.

## Flujo funcional resumido

1. El usuario se registra o inicia sesión (Supabase Auth).
2. Al iniciar sesión, se asegura su fila en `public.users`.
3. La partida se guarda en `users.game` y la máxima puntuación en `users.max_score`.
4. El ranking se consulta ordenando por `max_score` descendente.
5. El avatar se sube a Storage y se muestra mediante signed URL.

## Estado actual

- Frontend funcional con login, registro y juego.
- Persistencia de progreso y ranking en Supabase.
- Tests unitarios para lógica del juego en carpeta `test/`.

## Autoría y contexto académico

Trabajo realizado como proyecto trimestral de la asignatura DWEC en 2º de DAW.
