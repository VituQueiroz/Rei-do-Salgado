# 🥐 Rei do Salgado — Sistema de Pedidos Online

> Cardápio digital com carrinho de compras e envio de pedidos via WhatsApp.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-CDN-38BDF8?logo=tailwindcss)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)

---

## 📋 Sobre o Projeto

O **Rei do Salgado** é um sistema web de pedidos desenvolvido como projeto acadêmico para a disciplina de Gerência de Projetos, do curso de Análise e Desenvolvimento de Sistemas da Fatec Taquaritinga. O aplicativo simula o cardápio digital de uma lanchonete brasileira, permitindo que o cliente monte seu pedido, informe os dados de entrega e envie o pedido diretamente para o WhatsApp do estabelecimento.

### Funcionalidades

- Vitrine de produtos com filtro por categoria e busca por nome
- Carrinho de compras com controle de quantidade por item
- Seleção entre retirada no local ou entrega com cálculo de frete
- Formulário de entrega com validação de campos
- Formas de pagamento (Pix, Débito, Crédito, Dinheiro)
- Campo de observações: para anotações livres no pedido 
- Geração automática de mensagem formatada para WhatsApp
- Layout responsivo para desktop e dispositivos móveis

---

## 🎨 Layout

O projeto utiliza uma identidade visual quente e acolhedora, com paleta de cores terrosas e douradas que remetem à tradição das lanchonetes brasileiras.

| Cor | Token | Hex |
|-----|-------|-----|
| Dourado principal | `brand-500` | `#f59e0b` |
| Âmbar escuro | `brand-600` | `#d97706` |
| Marrom terroso | `salgado-deep` | `#c47a2b` |
| Marrom profundo | `salgado-dark` | `#7c4a1e` |
| Creme claro | `salgado-light` | `#fdf6ec` |

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| [React 18](https://react.dev/) | Biblioteca principal de UI |
| [Vite 5](https://vitejs.dev/) | Bundler e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização via CDN |
| [Google Fonts](https://fonts.google.com/) | Fontes Baloo 2 e Nunito |
| [Vercel](https://vercel.com/) | Plataforma de deploy |

---

## 📁 Estrutura do Projeto

```
rei-do-salgado/
├── public/
│   ├── favicon/
│   │       └── favicon.png
│   └── images/
│       ├── logos/
│       │   ├── rei-do-salgado.png
│       │   └── rei-do-salgado-horizontal.png
│       └── produtos/
│           ├── coxinha-de-frango.jpg
│           └── ...
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── FormProduto.jsx
│   │   ├── Header.jsx
│   │   ├── CardProduto.jsx
│   │   ├── Carrinho.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── produtos.js
│   ├── pages/
│   │   └── Admin.jsx
│   ├── services/
│   │   ├── supabase.js
│   │   └── produtosService.js
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── index.html
├── vercel.json
├── vite.config.js
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- npm versão 9 ou superior

### Instalação

```bash
# Clone o repositório
git clone https://github.com/brenopavanelli/web-lanchonete.git

# Acesse a pasta do projeto
cd web-lanchonete

# Instale as dependências
npm install i
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
VITE_WHATSAPP_NUMBER=5511999999999
```

> ⚠️ Nunca suba o arquivo `.env` para o repositório. Ele já está listado no `.gitignore`.

### Executando

```bash
# Inicia o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

---

## 📦 Build e Deploy

```bash
# Gera a build de produção
npm run build

# Visualiza a build localmente antes de subir
npm run preview
```

O projeto está configurado para deploy automático na **Vercel**. Cada push na branch `main` gera um novo deploy em produção. Branches de feature geram URLs de preview automáticas.

> ⚠️ Lembre-se de cadastrar a variável `VITE_WHATSAPP_NUMBER` no painel da Vercel em **Settings → Environment Variables** e realizar um redeploy após o cadastro.

---

## 🗄️ Banco de Dados e Painel do Administrador

O cardápio é armazenado no [Supabase](https://supabase.com/) (PostgreSQL). Se as variáveis do Supabase não estiverem no `.env`, o site usa o cardápio local de `src/data/produtos.js` (somente leitura).

### Configurando o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com/).
2. Em **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas `categorias` e `produtos`, as regras de segurança, o bucket de fotos e o cardápio inicial.
3. Em **Authentication → Users → Add user**, crie o usuário administrador (e-mail e senha) e marque **Auto Confirm User**.
4. No **SQL Editor**, abra `supabase/admin.sql`, troque o e-mail pelo do administrador e clique em **Run**. Só usuários cadastrados na tabela `admins` podem alterar o cardápio.
5. Em **Authentication → Sign In / Providers**, desative **"Allow new users to sign up"** (recomendado; o site não usa cadastro público).
6. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public* para o `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> A chave *anon* pode ficar no front-end: as regras de segurança (RLS) do banco só permitem leitura para visitantes. Inserir, alterar e excluir exige login de um usuário cadastrado em `admins`. **Nunca** use a chave *service_role* no front-end.

### Usando o painel

Acesse [http://localhost:5173/admin](http://localhost:5173/admin) e entre com o usuário criado. No painel é possível:

- Cadastrar novos produtos (com envio de foto)
- Editar nome, descrição, preço, categoria e foto
- Marcar produtos como disponíveis/indisponíveis
- Excluir produtos e criar novas categorias

Na Vercel, cadastre também `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Settings → Environment Variables**. O arquivo `vercel.json` garante que a rota `/admin` funcione em produção.

---

## 📱 Exemplo de Mensagem Gerada

```
🛒 *Novo Pedido*

• 2x Coxinha de Frango — R$ 12,00
• 1x Pão de Queijo — R$ 4,50

━━━━━━━━━━━━━━
🧾 Subtotal: R$ 16,50
🚚 Frete: R$ 9,90
*Total: R$ 26,40*

📝 *Observações:* Sem catupiry na coxinha, por favor.

📍 *Endereço de Entrega*
CEP: 14870-000
Rua: Rua das Flores, nº 42
Bairro: Centro

💰 *Forma de Pagamento:* Pix

Por favor, confirme meu pedido! 😊
```

---

## 👨‍💻 Autor

Desenvolvido por **Breno Pavanelli dos Santos**

[![GitHub](https://img.shields.io/badge/GitHub-seu--usuario-181717?logo=github)](https://github.com/brenopavanelli)

---

## 📄 Licença

Este projeto foi desenvolvido para fins **acadêmicos**. Todos os direitos reservados.