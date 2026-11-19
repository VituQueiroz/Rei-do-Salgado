// src/components/Footer.jsx

const ANO_ATUAL = new Date().getFullYear();

function TituloSecao({ children }) {
  return (
    <h3 className="font-display font-bold text-brand-300 text-base mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function LinkFooter({ href = "#", onClick, children }) {
  function handleClick(e) {
    if (!onClick) return;
    e.preventDefault();
    onClick();
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="font-body text-sm text-brand-200 hover:text-brand-300 transition-colors duration-150 flex items-center gap-1.5 group"
    >
      <span className="w-1 h-1 rounded-full bg-brand-500 group-hover:bg-brand-300 transition-colors flex-shrink-0" />
      {children}
    </a>
  );
}

// categorias: lista vinda do banco (sem "Todos"); onSelecionarCategoria filtra o cardápio
export default function Footer({ categorias = [], onSelecionarCategoria }) {
  return (
    <footer className="bg-salgado-dark mt-16">

      {/* Faixa superior decorativa */}
      <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ── Quem Somos ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <img
                src="/images/logos/rei-do-salgado-horizontal.png"
                alt="Rei do Salgado"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="font-body text-sm text-brand-200 leading-relaxed">
              Desde 1987, o Rei do Salgado leva sabor e tradição para cada mesa. Salgados fresquinhos, feitos com ingredientes selecionados e muito amor — digno de um rei.
            </p>
            {/* Redes sociais */}
            <div className="flex gap-3 mt-4">
              {[
                { label: "Instagram", icon: "/images/logos/instagram.png" },
                { label: "Facebook",  icon: "/images/logos/facebook.png" },
                { label: "WhatsApp",  icon: "/images/logos/whatsapp.png" },
              ].map((rede) => (
                <a
                  key={rede.label}
                  href="#"
                  title={rede.label}
                  className="w-9 h-9 bg-salgado-deep hover:bg-brand-600 rounded-full flex items-center justify-center text-base transition-colors"
                >
                  <img src={rede.icon} alt={rede.label} className="w-5 h-5 object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Mapa do Site ── */}
          <div>
            <TituloSecao>🗺️ Mapa do Site</TituloSecao>
            <nav className="space-y-2">
              <LinkFooter href="#cardapio" onClick={() => onSelecionarCategoria?.("Todos")}>
                Cardápio
              </LinkFooter>
              {categorias.map((cat) => (
                <LinkFooter
                  key={cat}
                  href="#cardapio"
                  onClick={() => onSelecionarCategoria?.(cat)}
                >
                  {cat}
                </LinkFooter>
              ))}
            </nav>
          </div>

          {/* ── Contato ── */}
          <div>
            <TituloSecao>📞 Contato</TituloSecao>
            <div className="space-y-3">
              <div className="font-body text-sm text-brand-200 space-y-1">
                <p className="flex items-start gap-2">
                  <span className="mt-0.5">📍</span>
                  <span>Rua das Acácias, 142<br />Centro — São Paulo, SP</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📱</span>
                  <a href="#" className="hover:text-brand-300 transition-colors">
                    (11) 99999-0000
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href="#" className="hover:text-brand-300 transition-colors">
                    contato@reidosalgado.com.br
                  </a>
                </p>
              </div>
              <div className="font-body text-sm text-brand-200">
                <p className="font-semibold text-brand-400 mb-1">Horário de funcionamento</p>
                <p>Seg – Sex: 07h às 19h</p>
                <p>Sáb – Dom: 08h às 14h</p>
              </div>
            </div>
          </div>

          {/* ── Legal ── */}
          <div>
            <TituloSecao>📄 Informações</TituloSecao>
            <nav className="space-y-2">
              <LinkFooter>Quem Somos</LinkFooter>
              <LinkFooter>Trabalhe Conosco</LinkFooter>
            </nav>
            <div className="mt-4 p-3 bg-salgado-deep/40 rounded-xl border border-salgado-deep">
              <p className="font-body text-xs text-brand-400 leading-relaxed">
                Este site não armazena dados de pagamento. Todas as transações
                são discutidas diretamente pelo WhatsApp.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Barra de copyright */}
      <div className="border-t border-salgado-deep">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-body text-brand-600">
          <p>© {ANO_ATUAL} Lanchonete Rei do Salgado. Todos os direitos reservados.</p>
          <p>
            Salgados dignos de um rei, entregues com tradição em São Paulo.
          </p>
        </div>
      </div>

    </footer>
  );
}