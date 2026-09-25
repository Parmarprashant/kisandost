# AgriShield 360° — Phase 0: Map & GIS Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of GIS mapping components, tile providers, coordinates, and spatial capabilities in `kisan-dost/ventureHack/kisan-next/src/components/farmer-tools/FarmMap.tsx`, `AIMapComponent.tsx`, and `DistrictMap.tsx`.

---

## 1. Map System Specifications

```text
Map library/provider: Leaflet (v1.9.4) & React-Leaflet (v5.0.0). Tile imagery provider: Google Maps Hybrid Satellite Raster Tiles (url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}")
Map component: 
  - FarmMap (src/components/farmer-tools/FarmMap.tsx)
  - AIMapComponent (src/components/farmer-tools/AIMapComponent.tsx)
  - DistrictMap (src/components/farmer-tools/DistrictMap.tsx)
API key/environment variable: None required. Google Maps hybrid tiles are loaded via direct raster tiles URL; no GOOGLE_MAPS_API_KEY environment variable is configured or required in the frontend.
Coordinate format: WGS84 Decimal Degrees: [latitude, longitude] as numbers (e.g., [23.2156, 72.6369])
Existing location functionality:
  1. Click-to-locate: Clicking on the map places a marker and triggers onLocationSelect(lat, lon)
  2. Auto-centering: RecenterMap subcomponent repositions viewport to the farmer's resolved weather/IP location
  3. Reverse Geocoding: Reverse lookup of lat/lon to village, district, state via /api/location/reverse (OpenStreetMap Nominatim) and BigDataCloud
Existing map utilities:
  - createDefaultIcon(): Bypasses Next.js SSR Webpack asset-hashing bugs for Leaflet marker icons by loading unpkg assets
  - Dynamic Client Import: Next.js ssr: false wrapper preventing "window is not defined" server crashes during SSR
```

---

## 2. Spatial Capability Assessment for AgriShield 360°

| Capability | Current State | Code Inspection Verdict |
|---|---|---|
| **GPS Point Display** | **REAL EXISTING FUNCTIONALITY** | Fully implemented in `FarmMap.tsx` via `LocationMarker` and Leaflet `Marker`. Displays a pin at the farmer's selected location. |
| **Polygon Display** | **NOT IMPLEMENTED** | `react-leaflet` supports `<Polygon />` and `<GeoJSON />`, but neither is imported or implemented in any existing component. |
| **Polygon Editing** | **NOT IMPLEMENTED** | No GIS drawing plugins (such as `leaflet-draw` or `@geoman-io/leaflet-geoman-free`) are installed or present in `package.json`. There are no click-to-draw vertex tools. |
| **Polygon Storage** | **NOT IMPLEMENTED** | MongoDB `Field` model schema (`src/models/Field.ts`) only possesses single numeric fields: `location.latitude` and `location.longitude`. It contains **no array or GeoJSON field** to persist polygon boundary vertices. |

---

## 3. AgriShield Architectural Path

1. **Phase 1 (Data Foundation & Point Location)**:
   - AgriShield can immediately reuse `FarmMap.tsx` as-is. Farmers pick a single GPS point on their field to determine localized weather coordinates, district, and regional ICAR variety recommendations.
2. **Phase 2 (Field Boundary Delineation)**:
   - To support farm parcel polygons, install a lightweight polygon drawing utility or implement a click-polygon builder using React state.
   - Update `src/models/Field.ts` to add `polygon: [{ lat: Number, lng: Number }]`.
