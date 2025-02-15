import { useCallback, useState } from "react"

import { selectionInfo } from "../../contexts/SavedFeaturesContext"

interface UseContextMenu {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuTab: string | null
  contextMenuFeature: selectionInfo | null
  handleContextMenu: (event: React.MouseEvent, selection?: selectionInfo, tab?: string) => void
  handleTabContextMenu: (event: React.MouseEvent, tab: string) => void
  handleClose: () => void
}

export const useContextMenu = (): UseContextMenu => {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null)
  const [contextMenuTab, setContextMenuTab] = useState<string | null>(null)
  const [contextMenuFeature, setContextMenuFeature] = useState<selectionInfo | null>(null)

  const handleContextMenu = useCallback((event: React.MouseEvent, selection?: selectionInfo, tab?: string) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    })
    setContextMenuFeature(selection || null)
    setContextMenuTab(tab || null)
  }, [])

  const handleTabContextMenu = useCallback((event: React.MouseEvent, tab: string) => {
    handleContextMenu(event, undefined, tab)
  }, [handleContextMenu])

  const handleClose = useCallback(() => {
    setContextMenu(null)
    setContextMenuTab(null)
    setContextMenuFeature(null)
  }, [])

  return {
    contextMenu,
    contextMenuTab,
    contextMenuFeature,
    handleContextMenu,
    handleTabContextMenu,
    handleClose,
  }
}
