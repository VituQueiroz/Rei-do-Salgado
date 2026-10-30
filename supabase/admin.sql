-- supabase/admin.sql
-- Rode DEPOIS de criar o usuário em Authentication → Users → Add user.
-- Troque o e-mail abaixo pelo e-mail do administrador e clique em Run.

insert into admins (user_id)
select id from auth.users where email = 'email-do-admin@exemplo.com'
on conflict do nothing;

-- Confere quem é administrador:
select u.email from admins a join auth.users u on u.id = a.user_id;
