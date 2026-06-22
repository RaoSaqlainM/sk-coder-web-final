import { useIDEStore } from "@/store/ideStore"
import { buildPreview } from "@/lib/previewBuilder"
import { runJavaScript } from "@/lib/jsRunner"
import { runWithPiston, detectLanguageFromExtension } from "@/lib/pistonRunner"
import { toast } from "sonner"

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<{
      runPythonAsync: (code: string) => Promise<unknown>
      globals: { get: (k: string) => unknown }
    }>
    _pyodide?: Awaited<ReturnType<NonNullable<Window["loadPyodide"]>>>
  }
}

let _pyodideReady = false
let _pyodideLoading = false

async function ensurePyodide(): Promise<boolean> {
  if (_pyodideReady && window._pyodide) return true
  if (_pyodideLoading) return false
  if (!window.loadPyodide) {
    _pyodideLoading = true
    return new Promise((resolve) => {
      const s = document.createElement("script")
      s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"
      s.onload = async () => {
        try {
          window._pyodide = await window.loadPyodide!({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" })
          _pyodideReady = true
          _pyodideLoading = false
          resolve(true)
        } catch { _pyodideLoading = false; resolve(false) }
      }
      s.onerror = () => { _pyodideLoading = false; resolve(false) }
      document.head.appendChild(s)
    })
  }
  return false
}

async function runPythonCode(code: string): Promise<{ output: string; error: string }> {
  const ready = await ensurePyodide()
  if (!ready) return { output: "", error: "Python is loading... please wait a moment and try again." }
  try {
    const py = window._pyodide!
    const wrapped = `
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
try:
${code.split("\n").map((l) => "    " + l).join("\n")}
except Exception as e:
    print(f"Error: {e}")
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
_buf.getvalue()
`
    const result = await py.runPythonAsync(wrapped)
    return { output: String(result || ""), error: "" }
  } catch (e) {
    return { output: "", error: String(e) }
  }
}

export default function TopBar() {
  const {
    isRunning, setIsRunning, fileTree, activeTabId,
    addTerminalLine, clearTerminal, setActivePanel, setShowSettings, getActiveFile,
    setPreviewContent, refreshPreview,
  } = useIDEStore()

  const activeFile = getActiveFile()

  async function handleRun() {
    if (isRunning) {
      setIsRunning(false)
      addTerminalLine({ type: "info", content: "Execution stopped." })
      return
    }

    if (!activeFile) {
      toast.error("Open a file first")
      return
    }

    const ext = activeFile.name.split(".").pop()?.toLowerCase() || ""

    if (["html", "htm"].includes(ext)) {
      const html = buildPreview(fileTree, activeFile.path)
      setPreviewContent(html)
      refreshPreview()
      setActivePanel("preview")
      toast.success("Preview updated")
      return
    }

    setActivePanel("terminal")
    clearTerminal()
    setIsRunning(true)

    try {
      if (["js", "jsx"].includes(ext)) {
        addTerminalLine({ type: "info", content: `▶ Running ${activeFile.name} (JavaScript)` })
        const result = runJavaScript(activeFile.content || "")
        for (const line of result.output) addTerminalLine({ type: "output", content: line })
        if (result.error) addTerminalLine({ type: "error", content: result.error })
        if (result.output.length === 0 && !result.error) addTerminalLine({ type: "info", content: "(no output)" })
        addTerminalLine({ type: "success", content: "✓ Done." })
        return
      }

      if (ext === "py") {
        addTerminalLine({ type: "info", content: `▶ Running ${activeFile.name} (Python 3)` })
        const { output, error } = await runPythonCode(activeFile.content || "")
        if (output) for (const l of output.trimEnd().split("\n")) addTerminalLine({ type: "output", content: l })
        if (error) addTerminalLine({ type: "error", content: error })
        if (!output && !error) addTerminalLine({ type: "info", content: "(no output)" })
        addTerminalLine({ type: "success", content: "✓ Done." })
        return
      }

      const lang = detectLanguageFromExtension(activeFile.name)
      if (lang) {
        addTerminalLine({ type: "info", content: `▶ Compiling & running ${activeFile.name} via Wandbox...` })
        const res = await runWithPiston(activeFile.content || "", lang)
        if (res.output) for (const l of res.output.split("\n")) addTerminalLine({ type: "output", content: l })
        if (res.stderr) for (const l of res.stderr.split("\n")) addTerminalLine({ type: "error", content: l })
        if (!res.output && !res.stderr) addTerminalLine({ type: "info", content: "(no output)" })
        addTerminalLine({ type: "success", content: "✓ Done." })
        return
      }

      toast.info(`No runner for .${ext} — try the Terminal tab`)
    } finally {
      setIsRunning(false)
    }
  }

  const canRun = !!activeFile && !isRunning
  const activeTabLabel = activeFile ? activeFile.name : null

  return (
    <div className="ide-topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">SK</div>
        <span>Coder</span>
      </div>

      {activeTabLabel && (
        <>
          <div className="topbar-divider" />
          <span className="topbar-breadcrumb">
            {activeTabLabel}
          </span>
        </>
      )}

      <div className="topbar-actions">
        <button
          className={`topbar-run-btn${isRunning ? " running" : ""}${!canRun && !isRunning ? " disabled" : ""}`}
          onClick={handleRun}
          title={isRunning ? "Stop execution" : activeFile ? `Run ${activeFile.name}` : "Open a file to run"}
          style={{ opacity: !activeFile && !isRunning ? 0.5 : 1 }}
        >
          {isRunning ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="2" width="3" height="8" rx="1"/>
              <rect x="7" y="2" width="3" height="8" rx="1"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <polygon points="2,1 11,6 2,11"/>
            </svg>
          )}
          {isRunning ? "Stop" : "Run"}
        </button>

        <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings (⚙)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
