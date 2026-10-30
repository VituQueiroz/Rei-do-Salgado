// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { listarProdutos, listarCategorias } from "./services/produtosService";
import Header from "./components/Header";
import CardProduto from "./components/Cardproduto";
import Carrinho from "./components/Carrinho";
import Footer from "./components/Footer";

export default function App() {
  const [carrinho, setCarrinho] = useState([]); // [{ ...produto, quantidade }]
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");

  useEffect(() => {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([listaProdutos, listaCategorias]) => {
        setProdutos(listaProdutos);
        setCategorias(["Todos", ...listaCategorias.map((c) => c.nome)]);
      })
      .catch(() => setErroCarregamento("Não foi possível carregar o cardápio."))
      .finally(() => setCarregando(false));
  }, []);

  function adicionarAoCarrinho(produto) {
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

  function removerDoCarrinho(id) {
    setCarrinho((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.quantidade === 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) =>
        i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i
      );
    });
  }

  function limparCarrinho() {
    setCarrinho([]);
  }

  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  function qtdNoCArinho(id) {
    return carrinho.find((i) => i.id === id)?.quantidade ?? 0;
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const porCategoria =
        categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
      const porBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      return porCategoria && porBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  return (
    <div className="min-h-screen bg-salgado-light">
      <Header
        totalItens={totalItens}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Hero / Boas-vindas */}
        <section className="bg-gradient-to-r from-salgado-dark to-salgado-deep rounded-2xl p-6 text-white flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-300 leading-tight">
              Fresquinhos e quentinhos
            </h2>
            <p className="font-body text-brand-200 mt-1 text-sm sm:text-base">
              Monte seu pedido da sua maneira! 🤤
            </p>
          </div>
            <img
            src="/images/logos/rei-do-salgado.png"
            alt="Rei do Salgado"
            className="w-16 h-16 object-contain hidden sm:block"
            />
        </section>

        {/* Busca */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar salgado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-salgado-warm focus:border-brand-400 focus:outline-none bg-white font-body text-salgado-dark placeholder-gray-400 shadow-sm transition-colors"
          />
        </div>

        {/* Filtro de categorias */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-body font-semibold text-sm transition-all duration-150 ${
                categoriaAtiva === cat
                  ? "bg-salgado-dark text-brand-300 shadow-md scale-105"
                  : "bg-white text-gray-500 border border-salgado-warm hover:border-brand-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {carregando ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-body font-semibold text-lg">Carregando cardápio...</p>
          </div>
        ) : erroCarregamento ? (
          <div className="text-center py-16 text-red-400 space-y-2">
            <p className="text-5xl">⚠️</p>
            <p className="font-body font-semibold text-lg">{erroCarregamento}</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <p className="text-5xl">🔎</p>
            <p className="font-body font-semibold text-lg">Nenhum produto encontrado</p>
            <p className="font-body text-sm">Tente outra busca ou categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtosFiltrados.map((produto, index) => (
              <div
                key={produto.id}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <CardProduto
                  produto={produto}
                  quantidadeNoCarrinho={qtdNoCArinho(produto.id)}
                  onAdicionar={adicionarAoCarrinho}
                  onRemover={removerDoCarrinho}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Carrinho lateral */}
      {carrinhoAberto && (
        <Carrinho
          itens={carrinho}
          onFechar={() => setCarrinhoAberto(false)}
          onAdicionar={adicionarAoCarrinho}
          onRemover={removerDoCarrinho}
          onLimpar={limparCarrinho}
        />
      )}
      
      <Footer />
    </div>
    
  );
}