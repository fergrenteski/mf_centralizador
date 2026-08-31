import { Suspense, lazy, useState, Component } from "react";

// Componentes remotos expostos por cada remote (Vite Module Federation).
const RemotePainel = lazy(() => import("painel/PainelAtendente"));
const RemoteFila = lazy(() => import("fila/ConsultaFila"));

const TABS = [
  { id: "painel", label: "Painel do Atendente", Component: RemotePainel },
  { id: "fila", label: "Consulta de Fila", Component: RemoteFila },
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
    // Reseta o erro ao trocar de aba.
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={styles.errorBox}>
          <strong>Não foi possível carregar este remote.</strong>
          <p style={styles.errorText}>{String(this.state.error)}</p>
          <p style={styles.errorHint}>
            Verifique se o app está no ar e se serve um <code>remoteEntry.js</code>{" "}
            na raiz.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [active, setActive] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === active);
  const ActiveComponent = activeTab.Component;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>MF Principal</h1>
        <span style={styles.subtitle}>Host — Module Federation</span>
      </header>

      <nav style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              ...styles.tab,
              ...(active === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={styles.content}>
        <RemoteErrorBoundary resetKey={active}>
          <Suspense fallback={<div style={styles.loading}>Carregando…</div>}>
            <ActiveComponent />
          </Suspense>
        </RemoteErrorBoundary>
      </main>
    </div>
  );
}

const styles = {
  page: {
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#1a1a2e",
    minHeight: "100vh",
    background: "#f4f5f7",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    padding: "20px 28px",
    background: "#16213e",
    color: "#fff",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle: { fontSize: 13, opacity: 0.7 },
  tabs: {
    display: "flex",
    gap: 4,
    padding: "0 28px",
    background: "#16213e",
  },
  tab: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px 8px 0 0",
    background: "transparent",
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabActive: {
    background: "#f4f5f7",
    color: "#16213e",
  },
  content: {
    padding: 28,
  },
  loading: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
  },
  errorBox: {
    padding: 20,
    borderRadius: 10,
    background: "#fff5f5",
    border: "1px solid #fed7d7",
    color: "#c53030",
  },
  errorText: { fontFamily: "monospace", fontSize: 13, wordBreak: "break-word" },
  errorHint: { color: "#742a2a", fontSize: 13 },
};
