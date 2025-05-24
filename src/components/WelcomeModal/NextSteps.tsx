import { Box, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import React from "react"
import { MdStarBorder, MdSearch, MdVpnKey, MdStorage, MdInfoOutline } from "react-icons/md" // Added more icons

const NextSteps = (): React.ReactNode => {
  return (
    <Box p={2} sx={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
      {" "}
      {/* Ensure scrollability for long content */}
      <Typography variant="h6" gutterBottom>
        New: Address Search (Geocoding)!
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdSearch /></ListItemIcon>
          <ListItemText
            primary="Search for Addresses"
            secondary="You can now search for addresses directly within the app using the new search bar in the top menu."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdInfoOutline /></ListItemIcon>
          <ListItemText
            primary="Powered by Google"
            secondary="This feature uses Google's Geocoding API to find locations."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdVpnKey /></ListItemIcon>
          <ListItemText
            primary="API Key Required"
            secondary="To use this, you'll need to provide your own Google Geocoding API key (due to potential costs associated with the API)."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdVpnKey /></ListItemIcon>
          <ListItemText
            primary="Setup Instructions"
            secondary="Click the 'Set API Key' icon (key symbol) in the top menu. You'll be prompted to enter your API key and a password."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdStorage /></ListItemIcon>
          <ListItemText
            primary="Secure Local Storage"
            secondary="Your API key is stored encrypted in your browser's local storage. For security, your password is NOT stored. You will be asked to enter your password each time you start a new session (or refresh the page) to unlock the geocoding feature."
          />
        </ListItem>
      </List>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Future Enhancements
      </Typography>
      <Typography variant="body1">
        There are a number of features that could further improve the experience using the app:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdStarBorder /></ListItemIcon>
          <ListItemText primary="Calculate driving/walking distances between POIs" />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdStarBorder /></ListItemIcon>
          <ListItemText primary="Enable searching on curated information (beyond current GeoJSON files)" />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdStarBorder /></ListItemIcon>
          <ListItemText primary="Allow creating projects/trips to keep different sets of POIs separate" />
        </ListItem>
        <ListItem>
          <ListItemIcon sx={{ minWidth: "32px" }}><MdStarBorder /></ListItemIcon>
          <ListItemText primary="Improve experience on mobile devices (responsive design enhancements)" />
        </ListItem>
      </List>

      <Typography variant="body1" sx={{ mt: 2 }}>
        If you have any suggestions or feedback, please let me know by creating an issue using the
        {" "}
        <Link href="https://github.com/jricardo27/trip_explorer/issues" target="_blank" rel="noopener">issue tracker</Link>
        .
      </Typography>
    </Box>
  )
}

export default NextSteps
