import React, { useEffect, useState, useContext, useRef, useCallback } from 'react'; // Added useCallback
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// import { v4 as uuidv4 } from 'uuid'; // uuidv4 is not used in this file

import SavedFeaturesContext, { DEFAULT_CATEGORY, SavedFeaturesStateType } from '../../contexts/SavedFeaturesContext'; // Added SavedFeaturesStateType
import { GeoJsonFeature } from '../../data/types';
import { LineDefinition } from '../../utils/idbUtils'; // Added LineDefinition

// Helper to extract coordinates, ensuring they are in [lat, lng] format
const getWaypoints = (features: GeoJsonFeature[]): L.LatLng[] => {
  return features
    .map((feature) => {
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        return L.latLng(lat, lng);
      }
      return null;
    })
    .filter((wp): wp is L.LatLng => wp !== null);
};

const RouteDrawer: React.FC = () => {
  const map = useMap();
  const { 
    savedFeatures, // This is currentProjectSavedFeatures: { [category: string]: GeoJsonFeature[] }
    currentProjectLines, 
    addNewLine 
  } = useContext(SavedFeaturesContext)!;

  const [routingControl, setRoutingControl] = useState<L.Routing.Control | null>(null);
  const summaryControlRef = useRef<L.Control | null>(null);
  const [activeWaypoints, setActiveWaypoints] = useState<L.LatLng[]>([]); // Store current waypoints for saving

  // Function to get all features from all categories in SavedFeaturesStateType
  const getAllFeaturesFromProject = (projectFeatures: SavedFeaturesStateType): GeoJsonFeature[] => {
    return Object.values(projectFeatures).flat();
  };

  const handleSaveRoute = useCallback(() => {
    if (activeWaypoints.length < 2) {
      alert("Not enough points in the current route to save.");
      return;
    }
    const routeName = prompt("Enter a name for this route:");
    if (routeName && routeName.trim() !== "") {
      // This is tricky: activeWaypoints are L.LatLng. We need to find the original POI IDs.
      // For this simplified version, we assume activeWaypoints were derived from DEFAULT_CATEGORY
      // or the first loaded line. We need a more robust way to track source POI IDs if routes
      // can be dynamically created/modified beyond just loading saved ones.
      // For now, let's assume we save the POIs from DEFAULT_CATEGORY if no specific line is "active"
      // or if we are saving a modification of it.
      
      let poiIdsToSave: string[] = [];
      const allProjectPois = getAllFeaturesFromProject(savedFeatures);

      if (currentProjectLines && currentProjectLines.length > 0 && activeWaypoints.length > 0) {
        // This implies we might be re-saving an existing displayed line, or a derivative.
        // For simplicity, let's assume we are saving the POIs of the *first* line if one is displayed
        // OR if no lines, the default category. This needs refinement for a more complex UI.
        const lineToDeriveFrom = currentProjectLines[0]; // Simplification
        const featuresForLine = lineToDeriveFrom.poiIds.map(id => 
          allProjectPois.find(f => f.properties?.id === id)
        ).filter((f): f is GeoJsonFeature => f !== undefined);
        
        if (featuresForLine.length === lineToDeriveFrom.poiIds.length) {
           poiIdsToSave = featuresForLine.map(f => f.properties!.id);
        } else {
            console.warn("Some POIs for the currently displayed line were not found. Saving based on default category.");
            poiIdsToSave = (savedFeatures[DEFAULT_CATEGORY] || []).map(f => f.properties?.id).filter((id): id is string => !!id);
        }

      } else {
        // Fallback: save POIs from DEFAULT_CATEGORY
        poiIdsToSave = (savedFeatures[DEFAULT_CATEGORY] || []).map(f => f.properties?.id).filter((id): id is string => !!id);
      }
      
      if (poiIdsToSave.length < 2) {
        alert("Not enough valid POI IDs found to save the route.");
        return;
      }

      addNewLine(routeName.trim(), poiIdsToSave)
        .then(() => alert("Route saved!"))
        .catch(err => {
          console.error("Failed to save route", err);
          alert("Error saving route.");
        });
    }
  }, [activeWaypoints, addNewLine, savedFeatures, currentProjectLines]);


  useEffect(() => {
    if (!summaryControlRef.current) {
      const CustomSummaryControl = L.Control.extend({
        onAdd: function(this: L.Control & { _div?: HTMLElement, _saveButton?: HTMLButtonElement }) {
          const div = L.DomUtil.create('div', 'leaflet-routing-summary-control leaflet-bar');
          div.style.backgroundColor = 'white';
          div.style.padding = '5px';
          div.style.opacity = '0.8';
          this._div = div;

          const saveButton = L.DomUtil.create('button', '', div);
          saveButton.innerHTML = 'Save Route';
          saveButton.style.marginTop = '5px';
          saveButton.style.display = 'block'; // Make it block to take full width or style as needed
          saveButton.onclick = handleSaveRoute; // Attach the handler
          this._saveButton = saveButton;
          
          this.update();
          return div;
        },
        update: function(this: L.Control & { _div?: HTMLElement }, summary?: { totalDistance: string; totalTime: string }) {
          if (this._div) {
            let content = '';
            if (summary) {
              content = `<b>Route:</b> ${summary.totalDistance}, ${summary.totalTime}`;
            }
            // Keep the button, only update the summary text part
            const textNode = this._div.childNodes[0]; // Assuming text is first, then button
            if (textNode && textNode.nodeName !== "BUTTON") {
                textNode.nodeValue = content;
            } else if (content) {
                 // If no text node or it was replaced, prepend new text
                const newText = document.createTextNode(content);
                this._div.insertBefore(newText, this._div.firstChild);
            } else if (textNode && textNode.nodeName !== "BUTTON") {
                // Clear content if no summary but ensure button isn't removed
                textNode.nodeValue = '';
            }
          }
        }
      });
      summaryControlRef.current = new CustomSummaryControl({ position: 'bottomleft' });
      summaryControlRef.current.addTo(map);
    }

    let featuresToRoute: GeoJsonFeature[] = [];
    const allProjectPois = getAllFeaturesFromProject(savedFeatures);

    if (currentProjectLines && currentProjectLines.length > 0) {
      const firstLine = currentProjectLines[0]; // Use the first line for now
      featuresToRoute = firstLine.poiIds.map(id => 
        allProjectPois.find(f => f.properties?.id === id)
      ).filter((f): f is GeoJsonFeature => f !== undefined);
      
      if (featuresToRoute.length !== firstLine.poiIds.length) {
        console.warn("Not all POIs for the saved line were found in current features. Route may be incomplete.");
      }
    } else {
      featuresToRoute = savedFeatures[DEFAULT_CATEGORY] || [];
    }

    if (featuresToRoute.length < 2) {
      if (routingControl) map.removeControl(routingControl);
      setRoutingControl(null);
      setActiveWaypoints([]);
      if (summaryControlRef.current && (summaryControlRef.current as any).update) {
        (summaryControlRef.current as any).update(null);
      }
      return;
    }

    const waypoints = getWaypoints(featuresToRoute);
    setActiveWaypoints(waypoints); // Store for saving

    if (waypoints.length < 2) {
      if (routingControl) map.removeControl(routingControl);
      setRoutingControl(null);
      if (summaryControlRef.current && (summaryControlRef.current as any).update) {
        (summaryControlRef.current as any).update(null);
      }
      return;
    }

    let currentRoutingControl = routingControl;
    if (currentRoutingControl) {
      map.removeControl(currentRoutingControl);
    }
    
    const newRoutingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      plan: L.Routing.plan(waypoints, { createMarker: () => null }),
      lineOptions: { styles: [{ color: 'blue', opacity: 0.6, weight: 4 }] }
    }).addTo(map);

    newRoutingControl.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
      const routes = e.routes;
      if (routes.length > 0) {
        const summary = routes[0].summary!;
        const distance = (summary.totalDistance / 1000).toFixed(2) + ' km';
        const timeInSeconds = summary.totalTime;
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const time = `${hours}h ${minutes}m`;
        if (summaryControlRef.current && (summaryControlRef.current as any).update) {
          (summaryControlRef.current as any).update({ totalDistance: distance, totalTime: time });
        }
      }
    });

    newRoutingControl.on('routingerror', (e) => {
      console.error("Routing error:", e.error);
      if (summaryControlRef.current && (summaryControlRef.current as any).update) {
        (summaryControlRef.current as any).update({ totalDistance: "Error", totalTime: "N/A" });
      }
    });

    setRoutingControl(newRoutingControl);
    
    return () => {
      if (map && newRoutingControl) map.removeControl(newRoutingControl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, savedFeatures, currentProjectLines]); // Depends on lines now

  useEffect(() => {
    return () => {
      if (summaryControlRef.current && map) {
        map.removeControl(summaryControlRef.current);
        summaryControlRef.current = null;
      }
    };
  }, [map]);

  return null; 
};

export default RouteDrawer;
