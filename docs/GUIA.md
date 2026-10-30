# Guia de uso e próximos passos — Rei do Salgado

## 1. Como usar o site (cliente)

1. Abra o site. O cardápio aparece com todos os produtos.
2. Use a **busca** ou os **botões de categoria** (Salgados Fritos, Bebidas…) para filtrar.
3. Clique em **Adicionar** no produto. Use **+** e **−** para mudar a quantidade.
4. Clique em **🛒 Carrinho** (canto superior direito).
5. No carrinho:
   - escreva **observações** (opcional);
   - escolha **Retirar no local** ou **Delivery** (delivery soma R$ 9,90 de frete e pede o endereço);
   - escolha a **forma de pagamento**.
6. Clique em **Enviar pedido pelo WhatsApp**. O WhatsApp abre com a mensagem do pedido pronta.

> Produtos marcados como indisponíveis aparecem apagados e não podem ser adicionados.

## 2. Como usar o painel do administrador

Requer o Supabase configurado (veja o README).

1. Acesse `/admin` (ex.: `http://localhost:5173/admin`).
2. Entre com o e-mail e a senha do administrador criados no Supabase. Contas que não estão na tabela `admins` veem a mensagem "Acesso negado".
3. No painel:
   - **+ Novo produto**: preencha foto, nome, descrição, preço (ex.: `7,50`), categoria e disponibilidade. Para criar uma categoria nova, digite no campo "Nova categoria" e clique em **Adicionar**.
   - **Editar**: altera qualquer dado do produto, inclusive a foto.
   - **Disponível / Indisponível**: clique na etiqueta para alternar. O cardápio público muda na hora.
   - **Excluir**: abre uma janela de confirmação no próprio painel; clique em **Excluir** para remover ou em **Cancelar** para desistir.
   - **Buscar produto**: filtra a lista pelo nome.
4. **Ver cardápio** abre o site público; **Sair** encerra a sessão.

## 3. O que foi testado

- Lint e build de produção sem erros.
- Cardápio funcionando sem banco (usa `src/data/produtos.js`).
- Painel testado contra um servidor que simula o Supabase: login (senha errada e certa), validação do formulário, criar categoria, criar produto com foto, editar com troca de foto, alternar disponibilidade, excluir e sair.
- Testado com o projeto Supabase real: o cardápio carrega do banco, visitantes sem login não conseguem gravar, e o administrador consegue entrar, criar, editar, alternar disponibilidade, enviar foto e excluir.

## 4. O que precisa ser implementado depois

### Obrigatório para colocar no ar
- [x] Criar o projeto no Supabase, rodar `supabase/schema.sql`, criar o usuário administrador e cadastrá-lo com `supabase/admin.sql`.
- [ ] Desativar o cadastro público no Supabase (Authentication → Sign In / Providers → "Allow new users to sign up").
- [ ] Cadastrar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_WHATSAPP_NUMBER` na Vercel e fazer redeploy.
- [x] Testar o painel com o banco real.

### Melhorias recomendadas
- [ ] **Gerenciar categorias**: renomear, excluir e mudar a ordem pelo painel (hoje só dá para criar).
- [ ] **Limpar fotos antigas**: ao trocar a foto ou excluir um produto, apagar o arquivo antigo do Storage.
- [ ] **Salvar pedidos no banco** (tabela `pedidos`) e criar uma tela de pedidos no painel, com status (recebido, em preparo, entregue).
- [ ] **Frete por bairro/CEP** em vez do valor fixo de R$ 9,90, e preencher o endereço automaticamente pelo CEP (API ViaCEP).
- [ ] **Configurações no painel**: número do WhatsApp, taxa de entrega e horário de funcionamento salvos no banco.
- [ ] **Loja fechada**: bloquear pedidos fora do horário de funcionamento.
- [ ] **Links do rodapé**: Instagram, Facebook, WhatsApp e páginas "Quem Somos" ainda apontam para `#`.

### Manutenção
- [ ] Remover a dependência `"i"` do `package.json` (entrou por engano via `npm install i`) e corrigir o README.
- [ ] Rodar `npm audit fix` (há 11 avisos de vulnerabilidade em dependências).
- [ ] Atualizar os selos do README (o projeto usa React 19 e Vite 8, não 18 e 5).
- [ ] Adicionar testes automatizados (ex.: Vitest + Testing Library) para carrinho e formulário do admin.
