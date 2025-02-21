import { Box, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import React from "react"
import { MdStarBorder } from "react-icons/md"

const About = (): React.ReactNode => {
  return (
    <Box p={2}>
      <Typography variant="body1">
        Trip Explorer is a simple application that enables users to select points of interest (POIs) from a curated list on a map and export them as a KML
        (Keyhole Markup Language) file.
      </Typography>

      <Typography variant="body1">
        This file can be imported into an offline map such as Organic Maps in case you are travelling to a remote area with no phone coverage.
      </Typography>

      <Typography variant="body1">
        <br />
        In addition to selecting POIs, the application allows users to sort and categorize them, making it easy to plan trips in advance using each category
        as a daily itinerary.
      </Typography>

      <Typography variant="body1">
        <br />
        Selected POIs are saved locally, and the application does not require a frontend or backend server, running entirely in the user&#39;s browser.
        <br />
        <br />
      </Typography>

      <Typography variant="h6">Technology</Typography>

      <Typography variant="body1">
        <br />
        Trip explorer is built using Typescript, React and Vite.
        <br />
        While the application can run on mobile devices, it is not yet optimized for mobile use.
      </Typography>

      <Typography variant="body1">
        <br />
        The map is powered by Leaflet and GeoJSON data is sourced from multiple providers, including:
      </Typography>

      <List>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://campermate.com/" target="_blank" rel="noopener noreferrer">Campermate</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://wikicamps.com.au/" target="_blank" rel="noopener noreferrer">Wiki Camps</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://www.bp.com/en_au/australia/home/who-we-are/find-your-nearest-bp.html" target="_blank" rel="noopener noreferrer">
                  BP Australia
                </Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://www.fuelwatch.wa.gov.au/" target="_blank" rel="noopener noreferrer">Fuel Watch</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://exploreparks.dbca.wa.gov.au/" target="_blank" rel="noopener noreferrer">Explore Parks WA</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://www.wavisitorcentre.com.au/" target="_blank" rel="noopener noreferrer">Western Australia Visitor Centre</Link>
              </Typography>
            )}
          />
        </ListItem>
        <ListItem sx={{ paddingBottom: 0 }}>
          <ListItemIcon><MdStarBorder /></ListItemIcon>
          <ListItemText
            sx={{ margin: 0 }}
            primary={(
              <Typography variant="body1">
                <Link href="https://www.westernaustralia.com/" target="_blank" rel="noopener noreferrer">Western Australia website</Link>
              </Typography>
            )}
          />
        </ListItem>
      </List>
    </Box>
  )
}

export default About
