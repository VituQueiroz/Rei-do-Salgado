// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { supabaseConfigurado } from "../services/supabase";
import {
  listarProdutos,
  listarCategorias,
  alterarDisponibilidade,
  excluirProduto,
  entrar,
  sair,
  obterSessao,
  observarSessao,
  ehAdministrador,
} from "../services/produtosService";
import FormProduto from "../components/admin/FormProduto";

function formatarPreco(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-salgado-light">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-2xl shadow-md border border-salgado-warm p-6 space-y-4"
      >
        <img
          src="/images/logos/rei-do-salgado.png"
          alt="Rei do Salgado"
          className="w-20 h-20 object-contain mx-auto"
        />
        <h1 className="font-display font-bold text-salgado-dark text-2xl text-center">
          Área do Administrador
        </h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-salgado-warm focus:border-brand-400 focus:outline-none font-body text-sm text-salgado-dark"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="senha" className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-salgado-warm focus:border-brand-400 focus:outline-none font-body text-sm text-salgado-dark"
          />
        </div>

        {erro && <p className="text-red-500 text-sm font-body">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 active:scale-95 transition-all text-white font-body font-bold py-3 rounded-full shadow"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <a href="/" className="block text-center text-sm text-gray-400 hover:text-salgado-deep font-body">
          ← Voltar ao cardápio
        </a>
      </form>
    </div>
  );
}

function Painel() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  // null = formulário fechado | {} = novo produto | produto = edição
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  // Produto aguardando confirmação de exclusão (null = nenhum)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Incrementar "versao" faz a lista ser recarregada do banco
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([listaProdutos, listaCategorias]) => {
        setProdutos(listaProdutos);
        setCategorias(listaCategorias);
        setErro("");
      })
      .catch((e) => setErro(`Erro ao carregar produtos: ${e.message}`))
      .finally(() => setCarregando(false));
  }, [versao]);

  async function handleDisponivel(produto) {
    try {
      await alterarDisponibilidade(produto.id, !produto.disponivel);
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p))
      );
    } catch (e) {
      setErro(`Erro ao alterar disponibilidade: ${e.message}`);
    }
  }

  // A confirmação fica no próprio painel: window.confirm é bloqueado em
  // alguns navegadores embutidos e devolve "cancelar" sem mostrar nada
  async function handleExcluir() {
    const produto = produtoParaExcluir;
    setExcluindo(true);
    try {
      await excluirProduto(produto.id);
      setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
      setErro("");
    } catch (e) {
      setErro(`Erro ao excluir: ${e.message}`);
    } finally {
      setExcluindo(false);
      setProdutoParaExcluir(null);
    }
  }

  function handleSalvo() {
    setProdutoEmEdicao(null);
    setVersao((v) => v + 1);
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-salgado-light">
      <header className="sticky top-0 z-40 bg-salgado-dark shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/logos/rei-do-salgado-horizontal.png"
              alt="Rei do Salgado"
              className="h-12 w-auto object-contain"
            />
            <span className="hidden sm:inline font-display font-bold text-brand-300 text-lg">
              Painel do Administrador
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-brand-200 hover:text-white font-body text-sm px-3 py-2 transition-colors"
            >
              Ver cardápio
            </a>
            <button
              onClick={sair}
              className="bg-salgado-deep hover:bg-brand-600 text-white font-body font-bold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h1 className="font-display font-bold text-salgado-dark text-2xl">
            Produtos do cardápio
          </h1>
          <button
            onClick={() => setProdutoEmEdicao({})}
            className="bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all text-white font-body font-bold text-sm px-5 py-2.5 rounded-full shadow"
          >
            + Novo produto
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-4 py-2.5 rounded-full border-2 border-salgado-warm focus:border-brand-400 focus:outline-none bg-white font-body text-salgado-dark placeholder-gray-400"
        />

        {erro && (
          <p className="bg-red-50 border border-red-200 text-red-600 font-body text-sm rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="text-center py-16 text-gray-400 font-body">Carregando...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-salgado-warm shadow-sm divide-y divide-salgado-warm">
            {produtosFiltrados.length === 0 && (
              <p className="text-center py-10 text-gray-400 font-body">Nenhum produto encontrado.</p>
            )}
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="flex items-center gap-3 p-3">
                <img
                  src={produto.imageUrl || "/images/logos/rei-do-salgado.png"}
                  alt={produto.nome}
                  className={`w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-salgado-warm ${
                    produto.disponivel ? "" : "opacity-40"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-salgado-dark leading-tight truncate">
                    {produto.nome}
                  </p>
                  <p className="font-body text-xs text-gray-400">{produto.categoria}</p>
                  <p className="font-body font-semibold text-salgado-deep text-sm">
                    {formatarPreco(produto.preco)}
                  </p>
                </div>

                <button
                  onClick={() => handleDisponivel(produto)}
                  title="Alternar disponibilidade"
                  className={`hidden sm:inline-block font-body text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    produto.disponivel
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {produto.disponivel ? "Disponível" : "Indisponível"}
                </button>

                <div className="flex flex-col sm:flex-row gap-1">
                  <button
                    onClick={() => setProdutoEmEdicao(produto)}
                    className="font-body text-sm font-semibold text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setProdutoParaExcluir(produto)}
                    className="font-body text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {produtoEmEdicao && (
        <FormProduto
          produto={produtoEmEdicao}
          categorias={categorias}
          onCategoriaCriada={(cat) => setCategorias((prev) => [...prev, cat])}
          onFechar={() => setProdutoEmEdicao(null)}
          onSalvo={handleSalvo}
        />
      )}

      {produtoParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4 font-body text-salgado-dark"
          >
            <h2 className="font-display font-bold text-xl">Excluir produto?</h2>
            <p className="text-sm">
              <strong>{produtoParaExcluir.nome}</strong> será removido do cardápio. Essa ação não
              pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setProdutoParaExcluir(null)}
                disabled={excluindo}
                className="text-sm font-semibold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={excluindo}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  // undefined = ainda verificando | null = deslogado | objeto = logado
  const [sessao, setSessao] = useState(undefined);
  // Resultado da checagem na tabela "admins", guardado por usuário
  const [verificacao, setVerificacao] = useState({ userId: null, admin: false });
  const userId = sessao?.user?.id;

  useEffect(() => {
    obterSessao().then(setSessao);
    return observarSessao(setSessao);
  }, []);

  useEffect(() => {
    if (!userId) return;
    ehAdministrador()
      .catch(() => false)
      .then((admin) => setVerificacao({ userId, admin }));
  }, [userId]);

  if (!supabaseConfigurado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-salgado-light">
        <div className="bg-white max-w-md rounded-2xl border border-salgado-warm p-6 space-y-3 font-body text-salgado-dark">
          <h1 className="font-display font-bold text-2xl">Banco de dados não configurado</h1>
          <p className="text-sm">
            Preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no
            arquivo <code>.env</code> e reinicie o <code>npm run dev</code>.
          </p>
          <a href="/" className="inline-block text-sm text-salgado-deep hover:underline">
            ← Voltar ao cardápio
          </a>
        </div>
      </div>
    );
  }

  if (sessao === undefined) {
    return <p className="text-center py-16 text-gray-400 font-body">Carregando...</p>;
  }

  if (!sessao) return <Login />;

  if (verificacao.userId !== userId) {
    return <p className="text-center py-16 text-gray-400 font-body">Verificando permissões...</p>;
  }

  if (!verificacao.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-salgado-light">
        <div className="bg-white max-w-md rounded-2xl border border-salgado-warm p-6 space-y-3 font-body text-salgado-dark">
          <h1 className="font-display font-bold text-2xl">Acesso negado</h1>
          <p className="text-sm">
            A conta <strong>{sessao.user.email}</strong> não é administradora. Peça para
            cadastrá-la com o script <code>supabase/admin.sql</code>.
          </p>
          <button onClick={sair} className="text-sm text-salgado-deep hover:underline">
            Sair e entrar com outra conta
          </button>
        </div>
      </div>
    );
  }

  return <Painel />;
}
