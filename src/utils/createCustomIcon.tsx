import L from "leaflet"
import React from "react"
import { renderToString } from "react-dom/server"
import { BsBrightnessAltHigh, BsFillCarFrontFill, BsFuelPump, BsHouseExclamation, BsImage } from "react-icons/bs"
import { FaCampground, FaCity, FaMapMarker, FaTheaterMasks, FaWineBottle } from "react-icons/fa"
import { GiBunkBeds, GiBus, GiCruiser, GiElephant, GiHelicopter, GiJourney, GiTicket } from "react-icons/gi"
import { MdFestival, MdHotel, MdKayaking, MdLocationCity, MdOutlineHiking, MdOutlinePark, MdOutlineTour, MdRestaurant } from "react-icons/md"
import { TbAirBalloon } from "react-icons/tb"

import { Big4Icon } from "../assets/Big4Icon.ts"
import { DiscoveryParksIcon } from "../assets/DiscoveryParksIcon"
import { MarkerIcon } from "../assets/MarkerIcon"

type IconType = React.ComponentType<{ size: number; color: string }>

type IconLibrary = Record<string, IconType>

const iconMapping: Record<string, IconLibrary> = {
  bs: { BsBrightnessAltHigh, BsFillCarFrontFill, BsFuelPump, BsHouseExclamation, BsImage },
  fa: { FaCampground, FaCity, FaMapMarker, FaTheaterMasks, FaWineBottle },
  gi: { GiBunkBeds, GiBus, GiCruiser, GiElephant, GiHelicopter, GiJourney, GiTicket },
  md: { MdFestival, MdHotel, MdKayaking, MdLocationCity, MdOutlineHiking, MdOutlinePark, MdOutlineTour, MdRestaurant },
  tb: { TbAirBalloon },
  custom: { Big4Icon, DiscoveryParksIcon },
}

const createCustomIcon = (iconName: string, iconColor: string = "grey", innerIconColor: string = "grey"): L.DivIcon => {
  const [iconSet, iconLibName] = iconName.split("/")
  const IconComponent = iconMapping[iconSet]?.[iconLibName as keyof typeof iconMapping[string]]

  if (!IconComponent) {
    console.error(`Icon "${iconName}" not found in "${iconSet}" set`)
    return L.divIcon({ html: "❓", className: "custom-icon" })
  }

  return L.divIcon({
    html: `
    <div style="position: relative;">
      ${renderToString(<MarkerIcon size={32} color={iconColor} />)}
      <div style="position: absolute; top: 45%; left: 65%; transform: translate(-50%, -50%);">
        ${renderToString(<IconComponent size={16} color={innerIconColor} />)}
      </div>
    </div>
  `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    className: "custom-icon",
  })
}

export default createCustomIcon
