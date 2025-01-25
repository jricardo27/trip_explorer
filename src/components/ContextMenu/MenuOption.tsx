import React from "react"

import styles from "./ContextMenu.module.css" // Import CSS Module

interface IMenuOptionsProps {
  title: string
  handler: (arg0: object) => void
  closeMenu?: () => void
  payload?: object
}

const MenuOption = ({ ...props }: IMenuOptionsProps): React.ReactNode => {
  const handleClick = (event) => {
    event.stopPropagation()
    props.handler(props.payload)

    if (props.closeMenu) {
      props.closeMenu()
    }
  }

  return (
    <div className={styles.contextMenuItem} onClick={handleClick}>
      {props.title}
    </div>
  )
}

export default MenuOption
