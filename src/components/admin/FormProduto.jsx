// src/components/admin/FormProduto.jsx
import { useState } from "react";
import {
  criarProduto,
  atualizarProduto,
  criarCategoria,
  enviarFoto,
} from "../../services/produtosService";

const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

const classeInput =
  "w-full px-3 py-2 rounded-lg border-2 focus:outline-none bg-white font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors";

function classeCampo(temErro) {
  return `${classeInput} ${
    temErro ? "border-red-400 focus:border-red-400" : "border-salgado-warm focus:border-brand-400"
  }`;
}

function Rotulo({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide"
    >
      {children}
    </label>
  );
}

export default function FormProduto({ produto, categorias, onCategoriaCriada, onFechar, onSalvo }) {
  const editando = Boolean(produto.id);

  const [form, setForm] = useState({
    nome: produto.nome ?? "",
    descricao: produto.descricao ?? "",
    preco: produto.preco != null ? produto.preco.toFixed(2).replace(".", ",") : "",
    categoriaId: produto.categoriaId ?? categorias[0]?.id ?? "",
    imageUrl: produto.imageUrl ?? "",
    disponivel: produto.disponivel ?? true,
  });
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(produto.imageUrl ?? "");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  function setCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: "" }));
  }

  function handleFoto(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErros((prev) => ({ ...prev, foto: "Selecione um arquivo de imagem." }));
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErros((prev) => ({ ...prev, foto: "A imagem deve ter no máximo 2 MB." }));
      return;
    }
    setErros((prev) => ({ ...prev, foto: "" }));
    setArquivoFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  }

  async function handleNovaCategoria() {
    if (!novaCategoria.trim()) return;
    try {
      const categoria = await criarCategoria(novaCategoria);
      onCategoriaCriada(categoria);
      setCampo("categoriaId", categoria.id);
      setNovaCategoria("");
    } catch (e) {
      setErroGeral(`Erro ao criar categoria: ${e.message}`);
    }
  }

  function validar() {
    const preco = Number(form.preco.replace(",", "."));
    const novosErros = {
      nome: !form.nome.trim() ? "Informe o nome." : "",
      preco: form.preco === "" || isNaN(preco) || preco < 0 ? "Informe um preço válido." : "",
      categoriaId: !form.categoriaId ? "Selecione uma categoria." : "",
    };
    setErros(novosErros);
    return !Object.values(novosErros).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    setErroGeral("");
    try {
      const imageUrl = arquivoFoto ? await enviarFoto(arquivoFoto) : form.imageUrl;
      const dados = { ...form, imageUrl, preco: form.preco.replace(",", ".") };
      if (editando) {
        await atualizarProduto(produto.id, dados);
      } else {
        await criarProduto(dados);
      }
      onSalvo();
    } catch (e) {
      setErroGeral(`Erro ao salvar: ${e.message}`);
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onFechar} />

      <form
        onSubmit={handleSubmit}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-salgado-light z-50 shadow-2xl flex flex-col bounce-in"
      >
        <div className="bg-salgado-dark px-5 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display font-bold text-brand-300 text-xl">
            {editando ? "✏️ Editar produto" : "➕ Novo produto"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="text-brand-400 hover:text-white text-2xl transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Foto */}
          <div className="flex flex-col gap-1">
            <Rotulo htmlFor="foto">Foto</Rotulo>
            <div className="flex items-center gap-3">
              <div className="w-24 h-20 rounded-lg overflow-hidden bg-salgado-warm flex-shrink-0 flex items-center justify-center">
                {previewFoto ? (
                  <img src={previewFoto} alt="Prévia" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFoto}
                className="font-body text-xs text-gray-500 file:mr-2 file:px-3 file:py-1.5 file:rounded-full file:border-0 file:bg-brand-500 file:text-white file:font-bold hover:file:bg-brand-600"
              />
            </div>
            {erros.foto && <p className="text-red-500 text-xs font-body">{erros.foto}</p>}
            <p className="text-gray-400 text-xs font-body">JPG ou WebP, de preferência 400x300px.</p>
          </div>

          {/* Nome */}
          <div className="flex flex-col gap-1">
            <Rotulo htmlFor="nome">Nome</Rotulo>
            <input
              id="nome"
              type="text"
              placeholder="Ex: Coxinha de Frango"
              value={form.nome}
              onChange={(e) => setCampo("nome", e.target.value)}
              maxLength={80}
              className={classeCampo(erros.nome)}
            />
            {erros.nome && <p className="text-red-500 text-xs font-body">{erros.nome}</p>}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <Rotulo htmlFor="descricao">Descrição</Rotulo>
            <textarea
              id="descricao"
              rows={3}
              placeholder="Descrição curta e apetitosa do produto."
              value={form.descricao}
              onChange={(e) => setCampo("descricao", e.target.value)}
              maxLength={200}
              className={classeCampo(false)}
            />
          </div>

          {/* Preço */}
          <div className="flex flex-col gap-1">
            <Rotulo htmlFor="preco">Preço (R$)</Rotulo>
            <input
              id="preco"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.preco}
              onChange={(e) => setCampo("preco", e.target.value)}
              className={classeCampo(erros.preco)}
            />
            {erros.preco && <p className="text-red-500 text-xs font-body">{erros.preco}</p>}
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1">
            <Rotulo htmlFor="categoria">Categoria</Rotulo>
            <select
              id="categoria"
              value={form.categoriaId}
              onChange={(e) => setCampo("categoriaId", e.target.value)}
              className={classeCampo(erros.categoriaId)}
            >
              <option value="">Selecione...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {erros.categoriaId && (
              <p className="text-red-500 text-xs font-body">{erros.categoriaId}</p>
            )}
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Nova categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className={classeCampo(false)}
              />
              <button
                type="button"
                onClick={handleNovaCategoria}
                className="flex-shrink-0 bg-salgado-warm hover:bg-brand-200 text-salgado-dark font-body font-bold text-sm px-3 rounded-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Disponível */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.disponivel}
              onChange={(e) => setCampo("disponivel", e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
            <span className="font-body text-sm text-salgado-dark font-semibold">
              Disponível para venda
            </span>
          </label>

          {erroGeral && (
            <p className="bg-red-50 border border-red-200 text-red-600 font-body text-sm rounded-xl px-3 py-2">
              {erroGeral}
            </p>
          )}
        </div>

        <div className="border-t border-salgado-warm px-5 py-4 bg-white flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 border-2 border-salgado-warm text-gray-500 hover:border-brand-300 font-body font-bold py-3 rounded-full transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 active:scale-95 transition-all text-white font-body font-bold py-3 rounded-full shadow"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </>
  );
}
