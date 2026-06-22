import { useEffect, useRef } from "react"
import { useIDEStore } from "@/store/ideStore"
import { exportToZip, downloadBlob } from "@/lib/importProject"
import { buildPreview } from "@/lib/previewBuilder"
import { toast } from "sonner"

export default function ContextMenu() {
  const {
    contextMenu, setContextMenu, deleteNode, setRenameNodeId,
    setNewItem, openTab, fileTree, setActivePanel, addTerminalLine,
    setTerminalInput, refreshPreview, setPreviewContent, clearTerminal,
    getActiveFile, settings,
  } = useIDEStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setContextMenu(null)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [setContextMenu])

  if (!contextMenu) return null

  const { x, y, node, isFolder } = contextMenu

  const ext = node?.type === "file" ? (node.name.split(".").pop()?.toLowerCase() || "") : ""
  const isHtml = ["html", "htm"].includes(ext)
  const isPython = ext === "py"
  const isJs = ["js", "jsx"].includes(ext)
  const isTs = ["ts", "tsx"].includes(ext)
  const isCompilable = ["cpp", "c", "java", "rs", "go", "kt", "rb", "php", "swift"].includes(ext)
  const isRunnable = isHtml || isPython || isJs || isTs || isCompilable

  async function handleExport() {
    if (!node) return
    if (node.type === "file") {
      const blob = new Blob([node.content || ""], { type: "text/plain" })
      downloadBlob(blob, node.name)
      toast.success(`Downloaded ${node.name}`)
    } else {
      const blob = await exportToZip([node])
      downloadBlob(blob, node.name + ".zip")
      toast.success(`Exported ${node.name}.zip`)
    }
    setContextMenu(null)
  }

  function handleCopyPath() {
    if (!node) return
    navigator.clipboard.writeText(node.path)
    toast.success("Path copied")
    setContextMenu(null)
  }

  function handleCopyContent() {
    if (!node || node.type !== "file") return
    navigator.clipboard.writeText(node.content || "")
    toast.success("Content copied")
    setContextMenu(null)
  }

  function handleDelete() {
    if (!node) return
    if (confirm(`Delete "${node.name}"?`)) {
      deleteNode(node.path)
      toast.success(`Deleted ${node.name}`)
    }
    setContextMenu(null)
  }

  function handleRename() {
    if (!node) return
    setRenameNodeId(node.id)
    setContextMenu(null)
  }

  function handleNewFile() {
    setNewItem(isFolder ? node!.id : null, "file")
    setContextMenu(null)
  }

  function handleNewFolder() {
    setNewItem(isFolder ? node!.id : null, "folder")
    setContextMenu(null)
  }

  function handleOpen() {
    if (!node || node.type !== "file") return
    openTab(node)
    setContextMenu(null)
  }

  function handleRunPreview() {
    if (!node || node.type !== "file") return
    const html = buildPreview(fileTree, node.path)
    setPreviewContent(html)
    refreshPreview()
    setActivePanel("preview")
    setContextMenu(null)
    toast.success("Preview updated")
  }

  function handleRunTerminal() {
    if (!node || node.type !== "file") return
    setActivePanel("terminal")
    clearTerminal()
    addTerminalLine({ type: "info", content: `# ${node.name}` })
    if (isPython) {
      setTerminalInput(node.content || "")
      addTerminalLine({ type: "info", content: "Code loaded in terminal input — press Run or Enter to execute." })
    } else {
      addTerminalLine({ type: "info", content: `Paste or run ${node.name} content in the terminal.` })
    }
    setContextMenu(null)
  }

  function handleOpenCodespace() {
    setActivePanel("cloud")
    setContextMenu(null)
    toast.info("Go to GitHub panel to open in Codespace")
  }

  const menuLeft = Math.min(x, window.innerWidth - 220)
  const menuTop = Math.min(y, window.innerHeight - 320)

  return (
    <div className="context-menu" ref={ref} style={{ left: menuLeft, top: menuTop }}>
      {node?.type === "file" && (
        <div className="context-menu-item" onClick={handleOpen}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Open in Editor
        </div>
      )}

      {node?.type === "file" && isRunnable && (
        <>
          <div className="context-menu-divider" />
          <div style={{ padding: "0.15rem 0.6rem 0.1rem", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Open With
          </div>

          {(isHtml) && (
            <div className="context-menu-item" onClick={handleRunPreview}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Preview (Live)
            </div>
          )}

          {(isPython || isJs || isTs) && (
            <div className="context-menu-item" onClick={handleRunTerminal}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              {isPython ? "Run in Python Terminal" : "Run in Terminal"}
            </div>
          )}

          <div className="context-menu-item" onClick={handleOpenCodespace}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            Open in GitHub Codespace
          </div>
        </>
      )}

      {isFolder && (
        <>
          <div className="context-menu-divider" />
          <div className="context-menu-item" onClick={handleNewFile}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            New File
          </div>
          <div className="context-menu-item" onClick={handleNewFolder}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            New Folder
          </div>
        </>
      )}

      <div className="context-menu-divider" />

      <div className="context-menu-item" onClick={handleRename}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Rename
      </div>

      <div className="context-menu-item" onClick={handleCopyPath}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy Path
      </div>

      {node?.type === "file" && (
        <div className="context-menu-item" onClick={handleCopyContent}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Content
        </div>
      )}

      <div className="context-menu-item" onClick={handleExport}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download
      </div>

      <div className="context-menu-divider" />

      <div className="context-menu-item danger" onClick={handleDelete}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        Delete
      </div>
    </div>
  )
}
