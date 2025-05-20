import React from "react"
import { usePoiSelection } from "../contexts/PoiSelectionContext.ts"
import { Box, Typography } from "@mui/material"

const SelectedPoisDisplay = () => {
  const { selectedRegion, selectedCategories } = usePoiSelection()

  return (
    <Box sx={{ p: 2, border: "1px dashed grey", mt: 2 }}>
      <Typography variant="h6">Selected POIs (Test Display)</Typography>
      <Typography>
        <strong>Selected Region:</strong> {selectedRegion || "None"}
      </Typography>
      <Typography>
        <strong>Selected Categories:</strong>
      </Typography>
      {selectedCategories.length > 0 ? (
        <ul>
          {selectedCategories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      ) : (
        <Typography component="span" sx={{ ml: 1 }}>None</Typography>
      )}
    </Box>
  )
}

export default SelectedPoisDisplay
