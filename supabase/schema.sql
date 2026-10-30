-- supabase/schema.sql
-- Execute este script no Supabase em: SQL Editor → New query → Run

-- ── Tabelas ─────────────────────────────────────────────

create table if not exists categorias (
  id     bigint generated always as identity primary key,
  nome   text not null unique,
  ordem  int  not null default 0
);

create table if not exists produtos (
  id            bigint generated always as identity primary key,
  nome          text          not null,
  descricao     text          not null default '',
  preco         numeric(10,2) not null check (preco >= 0),
  categoria_id  bigint        not null references categorias(id),
  image_url     text,
  disponivel    boolean       not null default true,
  criado_em     timestamptz   not null default now(),
  atualizado_em timestamptz   not null default now()
);

-- Atualiza "atualizado_em" automaticamente a cada UPDATE
create or replace function set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists produtos_atualizado_em on produtos;
create trigger produtos_atualizado_em
  before update on produtos
  for each row execute function set_atualizado_em();

-- ── Administradores ─────────────────────────────────────
-- Só os usuários listados aqui podem alterar o cardápio.
-- Mesmo que alguém crie uma conta no Supabase, não consegue editar nada.
-- Para cadastrar um administrador, use o script supabase/admin.sql.

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;
-- Sem políticas: a tabela não pode ser lida nem alterada pelo site.

create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ── Segurança (Row Level Security) ──────────────────────
-- Qualquer visitante pode LER o cardápio.
-- Somente administradores podem ALTERAR.

alter table categorias enable row level security;
alter table produtos   enable row level security;

drop policy if exists "leitura publica" on categorias;
create policy "leitura publica" on categorias for select using (true);

drop policy if exists "admin escreve" on categorias;
create policy "admin escreve" on categorias for all
  to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "leitura publica" on produtos;
create policy "leitura publica" on produtos for select using (true);

drop policy if exists "admin escreve" on produtos;
create policy "admin escreve" on produtos for all
  to authenticated using (is_admin()) with check (is_admin());

-- ── Storage: bucket público para as fotos dos produtos ──

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "fotos leitura publica" on storage.objects;
create policy "fotos leitura publica" on storage.objects for select
  using (bucket_id = 'produtos');

drop policy if exists "fotos admin envia" on storage.objects;
create policy "fotos admin envia" on storage.objects for insert
  to authenticated with check (bucket_id = 'produtos' and is_admin());

drop policy if exists "fotos admin altera" on storage.objects;
create policy "fotos admin altera" on storage.objects for update
  to authenticated using (bucket_id = 'produtos' and is_admin());

drop policy if exists "fotos admin remove" on storage.objects;
create policy "fotos admin remove" on storage.objects for delete
  to authenticated using (bucket_id = 'produtos' and is_admin());

-- ── Dados iniciais (mesmo cardápio de src/data/produtos.js) ──

insert into categorias (nome, ordem) values
  ('Salgados Fritos', 1),
  ('Salgados Assados', 2),
  ('Lanches', 3),
  ('Bebidas', 4)
on conflict (nome) do nothing;

insert into produtos (nome, descricao, preco, categoria_id, image_url)
select p.nome, p.descricao, p.preco, c.id, p.image_url
from (values
  ('Coxinha de Frango', 'Massa crocante recheada com frango desfiado temperado e catupiry.', 6.00, 'Salgados Fritos', '/images/produtos/coxinha-de-frango.jpg'),
  ('Quibe Frito', 'Quibe crocante por fora, macio por dentro, com recheio especial da casa.', 5.50, 'Salgados Fritos', '/images/produtos/quibe-frito.jpg'),
  ('Enroladinho de Salsicha', 'Massa leve enrolada em salsicha, douradinha na medida certa.', 5.00, 'Salgados Fritos', '/images/produtos/enroladinho-de-salsicha.jpg'),
  ('Pão de Queijo', 'Tradicional pão de queijo mineiro, quentinho e sequinho.', 4.50, 'Salgados Assados', '/images/produtos/pao-de-queijo.jpg'),
  ('Empada de Frango', 'Empada assada com recheio cremoso de frango com ervilha.', 7.00, 'Salgados Assados', '/images/produtos/empada-de-frango.jpg'),
  ('Esfiha de Carne', 'Esfiha aberta com carne temperada, cebola e tomate.', 6.50, 'Salgados Assados', '/images/produtos/esfiha-de-carne.jpg'),
  ('Misto Quente', 'Pão francês tostado com presunto e queijo derretido.', 10.00, 'Lanches', '/images/produtos/misto-quente.jpg'),
  ('Bauru', 'Clássico pão com rosbife, queijo derretido, tomate e pepino.', 14.00, 'Lanches', '/images/produtos/bauru.jpg'),
  ('Suco de Laranja', 'Suco natural de laranja espremido na hora. 300ml.', 8.00, 'Bebidas', '/images/produtos/suco-de-laranja.jpg'),
  ('Café com Leite', 'Café fresquinho com leite quentinho. Combinação perfeita.', 6.00, 'Bebidas', '/images/produtos/cafe-com-leite.jpg')
) as p(nome, descricao, preco, categoria, image_url)
join categorias c on c.nome = p.categoria
where not exists (select 1 from produtos);
