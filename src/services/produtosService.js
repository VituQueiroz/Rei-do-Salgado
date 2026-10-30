// src/services/produtosService.js
import { supabase, supabaseConfigurado } from "./supabase";
import { produtos as produtosLocais, categorias as categoriasLocais } from "../data/produtos";

const BUCKET_FOTOS = "produtos";

// Converte a linha do banco (snake_case) para o formato usado nos componentes
function paraProduto(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    descricao: linha.descricao,
    preco: Number(linha.preco),
    categoriaId: linha.categoria_id,
    categoria: linha.categorias?.nome ?? "",
    imageUrl: linha.image_url,
    disponivel: linha.disponivel,
  };
}

function paraLinha(produto) {
  return {
    nome: produto.nome.trim(),
    descricao: produto.descricao.trim(),
    preco: Number(produto.preco),
    categoria_id: Number(produto.categoriaId),
    image_url: produto.imageUrl || null,
    disponivel: produto.disponivel,
  };
}

function exigirSupabase() {
  if (!supabaseConfigurado) {
    throw new Error("Supabase não configurado. Preencha o arquivo .env.");
  }
}

// ── Leitura (cardápio público) ──────────────────────────

export async function listarCategorias() {
  if (!supabaseConfigurado) {
    return categoriasLocais
      .filter((nome) => nome !== "Todos")
      .map((nome, i) => ({ id: i + 1, nome }));
  }
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("ordem");
  if (error) throw error;
  return data;
}

export async function listarProdutos() {
  if (!supabaseConfigurado) return produtosLocais;
  const { data, error } = await supabase
    .from("produtos")
    .select("*, categorias(nome)")
    .order("categoria_id")
    .order("nome");
  if (error) throw error;
  return data.map(paraProduto);
}

// ── Escrita (somente administrador logado) ──────────────

export async function criarProduto(produto) {
  exigirSupabase();
  const { data, error } = await supabase
    .from("produtos")
    .insert(paraLinha(produto))
    .select("*, categorias(nome)")
    .single();
  if (error) throw error;
  return paraProduto(data);
}

export async function atualizarProduto(id, produto) {
  exigirSupabase();
  const { data, error } = await supabase
    .from("produtos")
    .update(paraLinha(produto))
    .eq("id", id)
    .select("*, categorias(nome)")
    .single();
  if (error) throw error;
  return paraProduto(data);
}

export async function alterarDisponibilidade(id, disponivel) {
  exigirSupabase();
  const { error } = await supabase
    .from("produtos")
    .update({ disponivel })
    .eq("id", id);
  if (error) throw error;
}

export async function excluirProduto(id) {
  exigirSupabase();
  const { data, error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  // Sem permissão, o banco não devolve erro: só não apaga nenhuma linha
  if (data.length === 0) {
    throw new Error("o produto não foi excluído. Entre de novo no painel e tente outra vez.");
  }
}

export async function criarCategoria(nome) {
  exigirSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .insert({ nome: nome.trim() })
    .select("id, nome")
    .single();
  if (error) throw error;
  return data;
}

// Envia a foto para o Storage e devolve a URL pública
export async function enviarFoto(arquivo) {
  exigirSupabase();
  const extensao = arquivo.name.split(".").pop().toLowerCase();
  const caminho = `${crypto.randomUUID()}.${extensao}`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
}

// ── Autenticação do administrador ───────────────────────

export async function entrar(email, senha) {
  exigirSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
}

export async function sair() {
  if (supabaseConfigurado) await supabase.auth.signOut();
}

export async function obterSessao() {
  if (!supabaseConfigurado) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Confere na tabela "admins" se o usuário logado pode editar o cardápio
export async function ehAdministrador() {
  if (!supabaseConfigurado) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  return data === true;
}

export function observarSessao(callback) {
  if (!supabaseConfigurado) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(sessao));
  return () => data.subscription.unsubscribe();
}
