import React, { useEffect, useState } from "react"

import { TPosition } from "../../data/types"

import styles from "./ContextMenu.module.css"

interface IContextMenuProps {
  position: TPosition
  onClose?: () => void
  children?: React.ReactNode
  payload?: object
}

const ContextMenu = ({ ...props }: IContextMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const payload = props.payload || {}

  useEffect(() => {
    if (!props.position) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [props.position])

  const closeMenu = () => {
    setIsOpen(false)

    if (props.onClose) {
      props.onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className={styles.contextMenu}
          style={{
            position: "absolute",
            left: props.position.x,
            top: props.position.y,
          }}
        >
          {React.Children.map(props?.children, (child) =>
            React.cloneElement(child, { closeMenu, payload }),
          )}
        </div>
      )}
    </>
  )
}

export default ContextMenu
