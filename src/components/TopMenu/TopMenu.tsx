import MenuIcon from "@mui/icons-material/Menu"
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material"
import React from "react"

interface TopMenuProps {
  onMenuClick: () => void
}

const TopMenu: React.FC<TopMenuProps> = ({ onMenuClick }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trip Explorer
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default TopMenu
