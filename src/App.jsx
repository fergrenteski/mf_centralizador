import { Suspense, lazy, useState, useMemo, useEffect, useRef, Component } from "react";
import "./App.css";

// Componentes remotos expostos por cada remote (Vite Module Federation).
const RemotePainel = lazy(() => import("painel/PainelAtendente"));
const RemoteFila = lazy(() => import("fila/ConsultaFila"));

// Base (RAIZ) das Azure Functions — o código monta `${BASE}/api/seed` etc.,
// então NÃO inclua "/api/..." aqui. Configure em .env via VITE_FUNCTIONS_URL.
//   local:     http://localhost:7071
//   produção:  https://<seu-app>.azurewebsites.net
const FUNCTIONS_BASE_URL = (
  import.meta.env.VITE_FUNCTIONS_URL || "http://localhost:7071"
).replace(/\/$/, "");

const IconDesk = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
  </svg>
);
const IconQueue = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="7" cy="7" r="2.4" /><circle cx="15" cy="7" r="2.4" />
    <path d="M3.5 18c0-2.5 1.8-4 3.5-4s3.5 1.5 3.5 4M11.5 18c0-2.5 1.8-4 3.5-4s3.5 1.5 3.5 4" />
  </svg>
);
const IconCross = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <path d="M12 6v12M6 12h12" />
  </svg>
);
const IconDb = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="3" /><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </svg>
);
const IconSpin = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
const IconUserPlus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M18 8v6M15 11h6" />
  </svg>
);

const TABS = [
  { id: "painel", label: "Painel do Atendente", Icon: IconDesk, Component: RemotePainel },
  { id: "fila", label: "Consulta de Fila", Icon: IconQueue, Component: RemoteFila },
];

// Impede que um erro ao carregar um remote derrube o host inteiro.
class RemoteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="state state--error">
          <div className="badge"><IconCross width="22" height="22" /></div>
          <h3>Este módulo está fora do ar</h3>
          <p>
            Não foi possível carregar o remote. Verifique se o app está publicado e
            servindo um <code>remoteEntry.js</code>.
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {String(this.state.error)}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Controle de seed: dispara POST /api/seed para popular a collection.
function SeedControl() {
  const [phase, setPhase] = useState("idle"); // idle | confirm | loading
  const [result, setResult] = useState(null); // { ok, unidades, pacientes } | { error }

  async function runSeed() {
    setPhase("loading");
    setResult(null);
    try {
      const res = await fetch(`${FUNCTIONS_BASE_URL}/api/seed`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.mensagem || `HTTP ${res.status}`);
      }
      setResult({
        ok: true,
        unidades: data.unidadesInseridas ?? 0,
        pacientes: data.pacientesInseridos ?? 0,
      });
    } catch (e) {
      const msg = /Failed to fetch/i.test(String(e))
        ? `API inacessível em ${FUNCTIONS_BASE_URL}`
        : e.message;
      setResult({ error: msg });
    } finally {
      setPhase("idle");
    }
  }

  if (phase === "confirm") {
    return (
      <div className="confirm" role="group" aria-label="Confirmar recriação dos dados">
        <span className="confirm__text">
          Isso <strong>apaga e recria</strong> todos os dados da fila. Continuar?
        </span>
        <button className="btn btn--confirm" onClick={runSeed}>Sim, popular</button>
        <button className="btn btn--ghost" onClick={() => setPhase("idle")}>Cancelar</button>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn--seed"
        onClick={() => setPhase("confirm")}
        disabled={phase === "loading"}
        title={`POST ${FUNCTIONS_BASE_URL}/api/seed`}
      >
        {phase === "loading" ? (
          <><IconSpin className="spin" /> Populando…</>
        ) : (
          <><IconDb /> Popular banco</>
        )}
      </button>

      {result?.ok && (
        <span className="readout readout--ok" role="status">
          <span className="tick">✓</span> populado
          <span className="readout__count">{result.unidades} unidades</span>·
          <span className="readout__count">{result.pacientes} pacientes</span>
        </span>
      )}
      {result?.error && (
        <span className="readout readout--err" role="alert">
          ✕ {result.error}
        </span>
      )}
    </>
  );
}

// Telinha (modal) para adicionar um paciente à fila de uma unidade.
function AddPatientModal({ onClose }) {
  const [unidades, setUnidades] = useState([]);
  const [carregandoUnidades, setCarregandoUnidades] = useState(true);
  const [unidadeId, setUnidadeId] = useState("");
  const [nome, setNome] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [phase, setPhase] = useState("form"); // form | saving | done
  const [erro, setErro] = useState(null);
  const [criado, setCriado] = useState(null);
  const nomeRef = useRef(null);

  // carrega as unidades para o select
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_BASE_URL}/api/fila`);
        const data = await res.json();
        if (!vivo) return;
        setUnidades(data);
        setUnidadeId(data[0]?.id ?? "");
      } catch {
        if (vivo) setErro(`Não foi possível carregar as unidades (${FUNCTIONS_BASE_URL}).`);
      } finally {
        if (vivo) setCarregandoUnidades(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  // Esc fecha; foco inicial no nome
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => nomeRef.current?.focus(), 60);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    setErro(null);
    if (!nome.trim()) { setErro('Informe o nome do paciente.'); nomeRef.current?.focus(); return; }
    if (!unidadeId) { setErro('Selecione uma unidade.'); return; }
    setPhase("saving");
    try {
      const res = await fetch(`${FUNCTIONS_BASE_URL}/api/fila/${unidadeId}/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), prioridade }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || `HTTP ${res.status}`);
      const uni = unidades.find((u) => u.id === unidadeId);
      setCriado({ ...data, unidadeNome: uni?.nome ?? unidadeId });
      setPhase("done");
    } catch (e2) {
      const msg = /Failed to fetch/i.test(String(e2))
        ? `API inacessível em ${FUNCTIONS_BASE_URL}`
        : e2.message;
      setErro(msg);
      setPhase("form");
    }
  }

  function novamente() {
    setNome("");
    setPrioridade("normal");
    setCriado(null);
    setErro(null);
    setPhase("form");
    setTimeout(() => nomeRef.current?.focus(), 40);
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar paciente à fila"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <IconUserPlus />
          <div>
            <h3 className="modal__title">Adicionar paciente</h3>
            <div className="modal__sub">Entrada na fila</div>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {phase === "done" ? (
          <div className="modal__body">
            <div className="done">
              <div className="done__mark">✓</div>
              <h4>Paciente na fila</h4>
              <div className="ticket">
                <div className="row"><span className="k">Nome</span><span>{criado.nome}</span></div>
                <div className="row"><span className="k">Unidade</span><span>{criado.unidadeNome}</span></div>
                <div className="row">
                  <span className="k">Prioridade</span>
                  <span className={criado.prioridade === "urgente" ? "v--urg" : "v--norm"}>
                    {criado.prioridade}
                  </span>
                </div>
                <div className="row"><span className="k">Senha</span><span>{criado.id}</span></div>
              </div>
            </div>
            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={onClose}>Fechar</button>
              <button className="btn btn--confirm" onClick={novamente}>Adicionar outro</button>
            </div>
          </div>
        ) : (
          <form className="modal__body" onSubmit={submit}>
            {erro && <div className="formerr" role="alert">{erro}</div>}

            <div className="field">
              <label className="field__label" htmlFor="uni">Unidade</label>
              <select
                id="uni"
                className="select"
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
                disabled={carregandoUnidades}
              >
                {carregandoUnidades && <option>Carregando unidades…</option>}
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} · {u.tipo} ({u.tamanhoFila} na fila)
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="nome">Nome do paciente</label>
              <input
                id="nome"
                ref={nomeRef}
                className="input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Maria Souza"
                maxLength={80}
              />
            </div>

            <div className="field">
              <span className="field__label">Prioridade</span>
              <div className="seg" role="radiogroup" aria-label="Prioridade">
                {["normal", "urgente"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={prioridade === p}
                    data-p={p}
                    className={`seg__opt${prioridade === p ? " is-on" : ""}`}
                    onClick={() => setPrioridade(p)}
                  >
                    <span className="pip" /> {p === "normal" ? "Normal" : "Urgente"}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn--seed" disabled={phase === "saving"}>
                {phase === "saving"
                  ? <><IconSpin className="spin" /> Adicionando…</>
                  : <><IconUserPlus width="16" height="16" /> Adicionar à fila</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AddPatientControl() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn--ghost" onClick={() => setOpen(true)}>
        <IconUserPlus width="16" height="16" /> Adicionar paciente
      </button>
      {open && <AddPatientModal onClose={() => setOpen(false)} />}
    </>
  );
}

export default function App() {
  const [active, setActive] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === active);
  const ActiveComponent = activeTab.Component;

  // host da API só para exibição no status.
  const apiHost = useMemo(() => {
    try { return new URL(FUNCTIONS_BASE_URL).host; } catch { return FUNCTIONS_BASE_URL; }
  }, []);

  return (
    <div className="app">
      <header className="board">
        <div className="board__row">
          <div className="brand">
            <span className="brand__mark">
              <span className="pulse" aria-hidden="true" />
              <IconCross stroke="#fff" />
            </span>
            <div>
              <h1 className="brand__name">Central de Filas</h1>
              <div className="brand__eyebrow">UBS · UPA · Atendimento</div>
            </div>
          </div>

          <div className="board__status" title={`API: ${FUNCTIONS_BASE_URL}`}>
            <span className="dot" /> API · {apiHost}
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Módulos">
        <div className="tabs__inner" role="tablist">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`tab${isActive ? " is-active" : ""}`}
                onClick={() => setActive(tab.id)}
              >
                <tab.Icon width="18" height="18" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="admin">
        <span className="admin__label"><IconDb width="14" height="14" /> Base de dados</span>
        <div className="admin__spacer" />
        <AddPatientControl />
        <SeedControl />
      </div>

      <main className="stage">
        <div className="card">
          <RemoteErrorBoundary resetKey={active}>
            <Suspense
              fallback={
                <div className="state">
                  <div className="state__ring" />
                  <h3>Carregando módulo</h3>
                  <p>Buscando o app remoto…</p>
                </div>
              }
            >
              <ActiveComponent />
            </Suspense>
          </RemoteErrorBoundary>
        </div>
      </main>

      <footer className="foot">
        Module Federation <span className="sep">·</span> host “Central de Filas”
        <span className="sep">·</span> backend Azure Functions + MongoDB
      </footer>
    </div>
  );
}
