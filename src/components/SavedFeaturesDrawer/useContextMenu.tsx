import { useCallback, useState } from "react"

import { GeoJsonFeature } from "../../data/types"

interface UseContextMenu {
  contextMenu: { mouseX: number; mouseY: number } | null
  contextMenuTab: string | null
  contextMenuFeature: GeoJsonFeature | null
  handleContextMenu: (event: React.MouseEvent, feature?: GeoJsonFeature, tab?: string) => void
  handleTabContextMenu: (event: React.MouseEvent, tab: string) => void
  handleClose: () => void
}

export const useContextMenu = (): UseContextMenu => {
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null)
  const [contextMenuTab, setContextMenuTab] = useState<string | null>(null)
  const [contextMenuFeature, setContextMenuFeature] = useState<GeoJsonFeature | null>(null)

  const handleContextMenu = useCallback((event: React.MouseEvent, feature?: GeoJsonFeature, tab?: string) => {
    event.preventDefault()
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    })
    setContextMenuFeature(feature || null)
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
