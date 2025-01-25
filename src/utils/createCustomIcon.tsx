import L from "leaflet"
import React from "react"
import { renderToString } from "react-dom/server"
import { IconType } from "react-icons"
import * as bsIcons from "react-icons/bs" // Bootstrap Icons
import * as faIcons from "react-icons/fa" // FontAwesome
import * as hiIcons from "react-icons/hi" // Heroicons
import { HiOutlineLocationMarker } from "react-icons/hi"
import * as mdIcons from "react-icons/md" // Material Design

type IconLibrary = Record<string, IconType>
type IconMapping = Record<string, IconLibrary>

const iconMapping: IconMapping = {
  bs: bsIcons,
  fa: faIcons,
  hi: hiIcons,
  md: mdIcons,
}

const createCustomIcon = (iconName: string, iconColor: string = "grey"): React.ReactNode => {
  const [iconSet, iconLibName] = iconName.split("/")
  const IconComponent = iconMapping[iconSet][iconLibName]

  if (!IconComponent) {
    console.error(`Icon "${iconName}" not found in "${iconSet}" set`)
    return L.divIcon({ html: "❓", className: "custom-icon" })
  }

  return L.divIcon({
    html: `
    <div style="position: relative;">
      ${renderToString(<HiOutlineLocationMarker size={32} color={iconColor} />)}
      <div style="position: absolute; top: 45%; left: 65%; transform: translate(-50%, -50%);">
        ${renderToString(<IconComponent size={16} color="grey" />)}
      </div>
    </div>
  `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    className: "custom-icon",
  })
}

export default createCustomIcon
