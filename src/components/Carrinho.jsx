import { useState } from "react";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "Pix", emoji: "💠" },
  { value: "debito", label: "Cartão de Débito", emoji: "💳" },
  { value: "credito", label: "Cartão de Crédito", emoji: "💳" },
  { value: "dinheiro", label: "Dinheiro", emoji: "💵" },
];

const ENDERECO_INICIAL = { cep: "", rua: "", numero: "", bairro: "" };

function formatarMensagem(itens, total, endereco, pagamento, observacoes, tipoEntrega, frete, subtotal) {
  const linhaItens = itens
    .map(
      (item) =>
        `• ${item.quantidade}x ${item.nome} — R$ ${(
          item.preco * item.quantidade
        )
          .toFixed(2)
          .replace(".", ",")}`,
    )
    .join("\n");

  const pagamentoLabel =
    FORMAS_PAGAMENTO.find((f) => f.value === pagamento)?.label ?? pagamento;

  return (
    `🛒 *Novo Pedido*\n\n` +
    `${linhaItens}\n\n` +
    `━━━━━━━━━━━━━━\n` +
    (tipoEntrega === "entregar"
      ? `🧾 Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n` +
        `🚚 Frete: R$ ${frete.toFixed(2).replace(".", ",")}\n\n` +
        `*Total: R$ ${total.toFixed(2).replace(".", ",")}*\n\n`
      : `*Total: R$ ${total.toFixed(2).replace(".", ",")}*\n\n`) +
    (observacoes.trim() ? `📝 *Observações:* ${observacoes}\n\n` : "") +
    (tipoEntrega === "entregar"
      ? `📍 *Endereço de Entrega*\n` +
        `CEP: ${endereco.cep}\n` +
        `Rua: ${endereco.rua}, nº ${endereco.numero}\n` +
        `Bairro: ${endereco.bairro}\n\n`
      : `🏃 *Retirada no local*\n\n`) +
    `💰 *Forma de Pagamento:* ${pagamentoLabel}\n\n` +
    `Por favor, confirme meu pedido! 😊`
  );
}

function Campo({
  label,
  id,
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-lg border-2 border-salgado-warm focus:border-brand-400 focus:outline-none bg-white font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors"
      />
    </div>
  );
}

export default function Carrinho({
  itens,
  onFechar,
  onAdicionar,
  onRemover,
  onLimpar,
}) {
  const [observacoes, setObservacao] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("");
  const [endereco, setEndereco] = useState(ENDERECO_INICIAL);
  const [pagamento, setPagamento] = useState("");
  const [erros, setErros] = useState({});

  const TAXA_ENTREGA = 9.90;
  const subtotal = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  );
  const frete = tipoEntrega === "entregar" ? TAXA_ENTREGA : 0;
  const total = subtotal + frete;

  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  function setcampo(campo, valor) {
    setEndereco((prev) => ({ ...prev, [campo]: valor }));
    // limpa erro do campo ao digitar
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: false }));
  }

  function validar() {
    const novosErros = {
      cep: tipoEntrega === "entregar" && !endereco.cep.trim(),
      rua: tipoEntrega === "entregar" && !endereco.rua.trim(),
      numero: tipoEntrega === "entregar" && !endereco.numero.trim(),
      bairro: tipoEntrega === "entregar" && !endereco.bairro.trim(),
      pagamento: !pagamento,
    };
    setErros(novosErros);
    return !Object.values(novosErros).some(Boolean);
  }

  function enviarWhatsApp() {
    if (itens.length === 0) return;
    if (!validar()) return;
    const mensagem = formatarMensagem(
      itens,
      total,
      endereco,
      pagamento,
      observacoes,
      tipoEntrega,
      frete,
      subtotal
    );
    // api.whatsapp.com em vez de wa.me: o redirecionamento do wa.me troca
    // emojis por "?" no WhatsApp Web/Desktop
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onFechar}
      />

      {/* Painel lateral */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-salgado-light z-50 shadow-2xl flex flex-col bounce-in">
        {/* Topo */}
        <div className="bg-salgado-dark px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-brand-300 text-xl">
              🛒 Seu Carrinho
            </h2>
            {totalItens > 0 && (
              <p className="text-brand-500 text-xs font-body">
                {totalItens} {totalItens === 1 ? "item" : "itens"}
              </p>
            )}
          </div>
          <button
            onClick={onFechar}
            className="text-brand-400 hover:text-white text-2xl transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          {/* Lista de itens */}
          <div className="px-4 py-4 space-y-3">
            {itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 text-gray-400 py-16">
                <span className="text-6xl">🧺</span>
                <p className="font-body font-semibold text-lg">
                  Carrinho vazio
                </p>
                <p className="font-body text-sm">
                  Adicione salgados deliciosos!
                </p>
              </div>
            ) : (
              itens.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-salgado-warm p-3 flex items-center gap-3 shadow-sm"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.nome}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-salgado-dark text-sm leading-tight truncate">
                      {item.nome}
                    </p>
                    <p className="font-body text-salgado-deep font-semibold text-sm">
                      R${" "}
                      {(item.preco * item.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-salgado-warm rounded-full px-1.5 py-1">
                    <button
                      onClick={() => onRemover(item.id)}
                      className="w-6 h-6 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
                    >
                      −
                    </button>
                    <span className="font-display font-bold text-salgado-dark w-4 text-center text-sm">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => onAdicionar(item)}
                      className="w-6 h-6 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulário — só aparece quando há itens */}
          {itens.length > 0 && (
            <div className="px-4 pb-4 space-y-5">
              {/* Observações */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                  Observações
                </label>
                <textarea
                  placeholder="Alguma observação sobre o seu pedido?"
                  value={observacoes}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors focus:outline-none bg-white border-salgado-warm focus:border-brand-400"
                  rows={3}
                />
              </div>

              {/* Tipo de entrega */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                  Tipo de entrega
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTipoEntrega("retirar")}
                    className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                      tipoEntrega === "retirar"
                        ? "bg-brand-500 text-white"
                        : "bg-salgado-warm text-salgado-dark hover:bg-salgado-light"
                    }`}
                  >
                    Retirar no local
                  </button>
                  <button
                    onClick={() => setTipoEntrega("entregar")}
                    className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                      tipoEntrega === "entregar"
                        ? "bg-brand-500 text-white"
                        : "bg-salgado-warm text-salgado-dark hover:bg-salgado-light"
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {tipoEntrega === "entregar" && (
                <div className="bg-white rounded-2xl border border-salgado-warm p-4 shadow-sm space-y-3">
                  {/* Endereço */}
                  <h3 className="font-display font-bold text-salgado-dark text-base flex items-center gap-2">
                    📍 Endereço de Entrega
                  </h3>

                  {/* CEP */}
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                      CEP
                    </label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={endereco.cep}
                      onChange={(e) => setcampo("cep", e.target.value)}
                      maxLength={9}
                      className={`w-full px-3 py-2 rounded-lg border-2 font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors focus:outline-none bg-white ${
                        erros.cep
                          ? "border-red-400 focus:border-red-400"
                          : "border-salgado-warm focus:border-brand-400"
                      }`}
                    />
                    {erros.cep && (
                      <p className="text-red-500 text-xs font-body">
                        Campo obrigatório
                      </p>
                    )}
                  </div>

                  {/* Rua */}
                  <div className="flex flex-col gap-1">
                    <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                      Rua
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da rua ou avenida"
                      value={endereco.rua}
                      onChange={(e) => setcampo("rua", e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-2 font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors focus:outline-none bg-white ${
                        erros.rua
                          ? "border-red-400 focus:border-red-400"
                          : "border-salgado-warm focus:border-brand-400"
                      }`}
                    />
                    {erros.rua && (
                      <p className="text-red-500 text-xs font-body">
                        Campo obrigatório
                      </p>
                    )}
                  </div>

                  {/* Número + Bairro lado a lado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                        Número
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 123"
                        value={endereco.numero}
                        onChange={(e) => setcampo("numero", e.target.value)}
                        maxLength={10}
                        className={`w-full px-3 py-2 rounded-lg border-2 font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors focus:outline-none bg-white ${
                          erros.numero
                            ? "border-red-400 focus:border-red-400"
                            : "border-salgado-warm focus:border-brand-400"
                        }`}
                      />
                      {erros.numero && (
                        <p className="text-red-500 text-xs font-body">
                          Obrigatório
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-body text-xs font-semibold text-salgado-dark uppercase tracking-wide">
                        Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Nome do bairro"
                        value={endereco.bairro}
                        onChange={(e) => setcampo("bairro", e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border-2 font-body text-sm text-salgado-dark placeholder-gray-300 transition-colors focus:outline-none bg-white ${
                          erros.bairro
                            ? "border-red-400 focus:border-red-400"
                            : "border-salgado-warm focus:border-brand-400"
                        }`}
                      />
                      {erros.bairro && (
                        <p className="text-red-500 text-xs font-body">
                          Obrigatório
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento */}
              <div className="bg-white rounded-2xl border border-salgado-warm p-4 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-salgado-dark text-base flex items-center gap-2">
                  💰 Forma de Pagamento
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <button
                      key={forma.value}
                      onClick={() => {
                        setPagamento(forma.value);
                        if (erros.pagamento)
                          setErros((prev) => ({ ...prev, pagamento: false }));
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 font-body text-sm font-semibold transition-all active:scale-95 ${
                        pagamento === forma.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : erros.pagamento
                            ? "border-red-300 text-gray-500 hover:border-brand-300"
                            : "border-salgado-warm text-gray-500 hover:border-brand-300"
                      }`}
                    >
                      <span>{forma.emoji}</span>
                      <span className="leading-tight">{forma.label}</span>
                    </button>
                  ))}
                </div>
                {erros.pagamento && (
                  <p className="text-red-500 text-xs font-body">
                    Selecione uma forma de pagamento
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé fixo */}
        {itens.length > 0 && (  
          <>
            <div className="border-t border-salgado-warm px-5 py-4 bg-white space-y-3 flex-shrink-0">
              {tipoEntrega === "entregar" && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                    <span className="font-body font-semibold text-gray-500">Subtotal</span>
                    <span className="font-body font-semibold text-salgado-dark text-base">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body font-semibold text-gray-500">Frete</span>
                      <span className="font-body font-semibold text-salgado-dark text-base">R$ {frete.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </>
              )}
              <div className={tipoEntrega === "entregar" ? "border-t border-salgado-warm pt-2" : ""}>
                <div className="flex items-center justify-between">
                  <span className="font-body font-bold text-gray-500 text-xl">
                    Total
                  </span>
                  <span className="font-display font-bold text-salgado-dark text-2xl">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              <button
                onClick={enviarWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white font-body font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md text-base"
              >
                <span className="text-xl">💬</span>
                Enviar pedido pelo WhatsApp
              </button>

              <button
                onClick={onLimpar}
                className="w-full text-center text-sm text-gray-400 hover:text-red-500 font-body transition-colors py-1"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
