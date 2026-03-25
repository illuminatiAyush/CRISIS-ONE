'use client';

/**
 * Interactive Map Component using Leaflet
 * Supports Multiple Visualizations: Pinpoint, Cluster, Hexbin, Choropleth
 * Supports Multiple Base Layers: Light, Dark, Satellite, Humanitarian
 */

import React, { useEffect, useRef, useState } from 'react';
import { Incident, Resource, Location } from '@/app/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface MapProps {
  incidents: Incident[];
  resources: Resource[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: Location) => void;
  showIncidents?: boolean;
  showResources?: boolean;
  selectedIncidentId?: string;
  selectedResourceId?: string;
  className?: string;
}

// Extended Types for External Libraries
declare global {
  interface Window {
    L: any;
    d3: any;
  }
}

export default function Map({
  incidents,
  resources,
  center = [40.7589, -73.9851],
  zoom = 12,
  height = '500px',
  onLocationSelect,
  showIncidents = true,
  showResources = true,
  selectedIncidentId,
  selectedResourceId,
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  // --- STATE ---
  const [map, setMap] = useState<any | null>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Controls
  const [activeLayer, setActiveLayer] = useState<'light' | 'dark' | 'satellite' | 'humanitarian'>('light');
  const [activeViz, setActiveViz] = useState<'pinpoint' | 'cluster' | 'choropleth' | 'heatmap'>('pinpoint');
  const [showControls, setShowControls] = useState(false);

  // Refs for Cleanup
  const layersRef = useRef<{
    tile?: any;
    markers?: any[];
    cluster?: any;
    heat?: any;

    choropleth?: any;
    userMarker?: any;
  }>({});

  // --- CONFIGURATION ---
  const tileLayers = {
    light: { name: 'Clean Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: 'CartoDB', text: 'text-slate-800' },
    dark: { name: 'Midnight Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: 'CartoDB', text: 'text-white' },
    satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Esri', text: 'text-white' },
    humanitarian: { name: 'Humanitarian', url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', attribution: 'OSM', text: 'text-slate-800' },
  };

  const vizModes = [
    { id: 'pinpoint', name: 'Pinpoint', icon: 'mdi:map-marker' },
    { id: 'cluster', name: 'Clustered', icon: 'mdi:hexagon-multiple' },
    { id: 'choropleth', name: 'Grid Density', icon: 'mdi:grid' },
    { id: 'heatmap', name: 'Heatmap', icon: 'mdi:fire' },
  ];

  // --- 1. LOAD LIBRARIES ---
  useEffect(() => {
    const loadLibs = async () => {
      if (typeof window === 'undefined') return;

      const loadScript = (src: string) => new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });

      const loadCSS = (href: string) => {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      };

      // Styles
      loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      loadCSS('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css');
      loadCSS('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css');

      // Scripts (Sequential for dependencies)
      if (!window.L) await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      await loadScript('https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js');
      await loadScript('https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js');
      await loadScript('https://d3js.org/d3.v7.min.js');
      await loadScript('https://unpkg.com/@asymmetrik/leaflet-d3@4.4.0/dist/leaflet-d3.js');

      setLibsLoaded(true);
      setIsLoading(false);
    };

    loadLibs();
  }, []);

  // --- 2. INIT MAP ---
  useEffect(() => {
    if (libsLoaded && mapRef.current && !map) {
      const L = window.L;
      const initialMap = L.map(mapRef.current.id, { zoomControl: false }).setView(center, zoom);

      // Initial Layer
      layersRef.current.tile = L.tileLayer(tileLayers.light.url, { maxZoom: 19 }).addTo(initialMap);

      if (onLocationSelect) {
        initialMap.on('click', (e: any) => onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng }));
      }

      setMap(initialMap);
    }
  }, [libsLoaded, mapRef, center, zoom, onLocationSelect]);

  // --- 3. HANDLE LAYERS & VIZ CHANGE ---
  useEffect(() => {
    if (!map || !window.L || !libsLoaded) return;
    const L = window.L;

    // A. Update Tile Layer
    if (layersRef.current.tile) map.removeLayer(layersRef.current.tile);
    layersRef.current.tile = L.tileLayer(tileLayers[activeLayer].url, {
      maxZoom: 19,
      attribution: tileLayers[activeLayer].attribution
    }).addTo(map);

    // B. Cleanup Visualizations
    if (layersRef.current.markers) layersRef.current.markers.forEach(m => m.remove());
    if (layersRef.current.cluster) map.removeLayer(layersRef.current.cluster);
    if (layersRef.current.heat) map.removeLayer(layersRef.current.heat);
    if (layersRef.current.choropleth) map.removeLayer(layersRef.current.choropleth);

    layersRef.current = { tile: layersRef.current.tile }; // Reset refs excluding tile

    if (!showIncidents || incidents.length === 0) return;

    // C. Render Selected Visualization
    switch (activeViz) {
      case 'pinpoint':
        renderPinpoints(L, map);
        break;
      case 'cluster':
        renderClusters(L, map);
        break;
      case 'heatmap':
        renderHeatmap(L, map);
        break;
      case 'choropleth':
        renderChoropleth(L, map);
        break;
    }

  }, [map, activeLayer, activeViz, incidents, showIncidents, libsLoaded]);

  // --- 4. RENDER USER LOCATION ---
  useEffect(() => {
    if (!map || !window.L || !userLocation) return;
    renderUserLocation(window.L, map);
  }, [map, userLocation]);

  // --- RENDER FUNCTIONS ---

  const renderPinpoints = (L: any, map: any) => {
    const markers: any[] = [];
    incidents.forEach(inc => {
      const color = getSeverityColor(inc.severity);
      const marker = L.circleMarker([inc.location.lat, inc.location.lon], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(`<b>${inc.category}</b><br/>${inc.severity}`);
      marker.addTo(map);
      markers.push(marker);
    });
    layersRef.current.markers = markers;
  };

  const renderClusters = (L: any, map: any) => {
    // If user wants "Dark Map", let's reinforce it? 
    // Actually relying on user to select Dark layer manually is better UX than forcing it.

    // Ensure library is loaded
    if (!L.markerClusterGroup) {
      console.warn("MarkerClusterGroup not loaded yet");
      return;
    }

    const markers = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
    });

    incidents.forEach(inc => {
      const color = getSeverityColor(inc.severity);
      const html = `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>`;
      const icon = L.divIcon({ html, className: 'bg-transparent', iconSize: [12, 12] });
      markers.addLayer(L.marker([inc.location.lat, inc.location.lon], { icon }).bindPopup(inc.category));
    });

    map.addLayer(markers);
    layersRef.current.cluster = markers;
  };

  const renderHeatmap = (L: any, map: any) => {
    const points = incidents.map(i => [i.location.lat, i.location.lon, i.severity === 'Critical' ? 1 : 0.5]);
    const gradient = activeLayer === 'dark' ? { 0.4: '#3b82f6', 0.8: '#f472b6', 1: '#ef4444' } : { 0.4: 'blue', 0.65: 'lime', 1: 'red' };
    layersRef.current.heat = L.heatLayer(points, { radius: 25, maxZoom: 10, gradient }).addTo(map);
  };



  const renderChoropleth = (L: any, map: any) => {
    // Simulated Grid since we don't have regions GeoJSON
    // 1. Create a grid over the bounds
    const bounds = map.getBounds();
    const cellSize = 0.01; // roughly 1km
    const grid: any = {};

    incidents.forEach(inc => {
      const gx = Math.floor(inc.location.lat / cellSize);
      const gy = Math.floor(inc.location.lon / cellSize);
      const key = `${gx},${gy}`;
      if (!grid[key]) grid[key] = { count: 0, lat: gx * cellSize, lon: gy * cellSize };
      grid[key].count++;
    });

    const rects = L.layerGroup();
    Object.values(grid).forEach((cell: any) => {
      const opacity = Math.min(cell.count * 0.2, 0.8);
      L.rectangle([[cell.lat, cell.lon], [cell.lat + cellSize, cell.lon + cellSize]], {
        color: 'transparent',
        fillColor: '#ef4444',
        fillOpacity: opacity,
        weight: 0
      }).bindTooltip(`${cell.count} Incidents`).addTo(rects);
    });

    rects.addTo(map);
    layersRef.current.choropleth = rects;
  };

  const renderUserLocation = (L: any, map: any) => {
    if (layersRef.current.userMarker) {
      layersRef.current.userMarker.remove();
    }

    if (!userLocation) return;

    // Custom CSS-based Blue Dot
    const html = `
      <div class="relative w-full h-full flex items-center justify-center">
        <div class="absolute w-full h-full bg-blue-500/50 rounded-full animate-ping"></div>
        <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg ring-2 ring-white/50"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'bg-transparent',
      html: html,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([userLocation.lat, userLocation.lon], {
      icon,
      zIndexOffset: 1000 // Always on top
    }).addTo(map);

    layersRef.current.userMarker = marker;
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#EAB308';
      default: return '#10B981';
    }
  };

  const handleLocateMe = () => {
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const { latitude, longitude } = p.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
        },
        (e) => {
          console.error("Geolocation error:", {
            code: e.code,
            message: e.message,
            PERMISSION_DENIED: e.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: e.POSITION_UNAVAILABLE,
            TIMEOUT: e.TIMEOUT
          });
          alert(`Could not get your location: ${e.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  if (isLoading) return <div className={`relative ${className} bg-slate-50 rounded-3xl animate-pulse`} style={{ height }} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`relative ${className} rounded-3xl overflow-hidden z-0`} style={{ height }}>
      <div ref={mapRef} id={mapId.current} className="w-full h-full z-0" style={{ height }} />

      {/* CONTROLS UI */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-[400]">

        {/* Toggle Controls */}
        <button onClick={() => setShowControls(!showControls)} className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 text-slate-700 hover:text-blue-600 transition-all self-end">
          <Icon icon={showControls ? "mdi:close" : "mdi:layers"} className="w-6 h-6" />
        </button>

        {/* Control Panel */}
        <AnimatePresence>
          {showControls && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 w-64 max-w-[calc(100vw-48px)] flex flex-col gap-4">

              {/* Layers */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Map Style</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(tileLayers).map(k => (
                    <button key={k} onClick={() => setActiveLayer(k as any)} className={`p-2 rounded-lg text-xs font-semibold border transition-all ${activeLayer === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {tileLayers[k as keyof typeof tileLayers].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Viz */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Viz</h4>
                <div className="flex flex-col gap-1">
                  {vizModes.map(mode => (
                    <button key={mode.id} onClick={() => setActiveViz(mode.id as any)} className={`flex items-center gap-3 p-2 rounded-xl text-sm transition-all ${activeViz === mode.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <Icon icon={mode.icon} className="w-5 h-5 opacity-70" />
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Locate Me */}
        {!showControls && (
          <button onClick={handleLocateMe} className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 text-slate-700 hover:text-blue-600 transition-all self-end">
            <Icon icon="mdi:crosshairs-gps" className="w-6 h-6" />
          </button>
        )}
      </div>
    </motion.div>
  );
}