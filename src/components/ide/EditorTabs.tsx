import { useIDEStore } from "@/store/ideStore"

function getFileIcon(language: string): string {
  const icons: Record<string, string> = {
    html: "🌐", css: "🎨", javascript: "🟨", typescript: "🔷",
    python: "🐍", cpp: "⚙️", c: "⚙️", java: "☕", kotlin: "🦾",
    rust: "🦀", go: "🐹", ruby: "💎", php: "🐘", swift: "🍎",
    markdown: "📝", json: "📋", yaml: "📄", xml: "📰", shell: "💻",
    sql: "🗄️", dart: "🎯", r: "📊", plaintext: "📄",
  }
  return icons[language] || "📄"
}

export default function EditorTabs() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useIDEStore()

  if (openTabs.length === 0) {
    return (
      <div className="ide-tabs-bar" style={{ alignItems: "center", padding: "0 1rem" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Open a file from the explorer →
        </span>
      </div>
    )
  }

  return (
    <div className="ide-tabs-bar">
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          className={`ide-tab ${tab.id === activeTabId ? "active" : ""} ${tab.modified ? "modified" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          title={tab.path}
        >
          <span style={{ fontSize: 11 }}>{getFileIcon(tab.language)}</span>
          <span>{tab.name}</span>
          {tab.modified && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", marginLeft: 2 }} />
          )}
          <button
            className="ide-tab-close"
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
            title="Close tab"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
