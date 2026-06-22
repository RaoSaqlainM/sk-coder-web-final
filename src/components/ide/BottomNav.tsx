import { useIDEStore } from "@/store/ideStore"
import type { ActivePanel } from "@/types/ide"

const NAV_ITEMS: { id: ActivePanel; title: string; icon: React.ReactNode }[] = [
  {
    id: "files",
    title: "Files",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: "editor",
    title: "Editor",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: "terminal",
    title: "SK-Terminals",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="3" width="20" height="18" rx="3"/>
        <polyline points="8 10 12 14 8 18"/>
        <line x1="14" y1="18" x2="20" y2="18"/>
      </svg>
    ),
  },
  {
    id: "preview",
    title: "Preview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: "ai",
    title: "SK-AI",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <path d="M9 9h.01M15 9h.01M9 15h6"/>
      </svg>
    ),
  },
  {
    id: "cloud",
    title: "GitHub",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { activePanel, setActivePanel, sidebarOpen, setSidebarOpen } = useIDEStore()

  function handleNav(id: ActivePanel) {
    if (id === "files") {
      setSidebarOpen(!sidebarOpen)
      if (!sidebarOpen) setActivePanel("files" as ActivePanel)
    } else {
      setSidebarOpen(false)
      setActivePanel(id)
    }
  }

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === "files" ? sidebarOpen : activePanel === item.id && !sidebarOpen
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => handleNav(item.id)}
            title={item.title}
          >
            {item.icon}
          </button>
        )
      })}
    </nav>
  )
}
