import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMapsKey } from '../config/keys.js';

// ── Curated eco-friendly places across India ──────────────────────────────────
// Shown as fallback when Places API is unavailable or billing not enabled
const CURATED_PLACES = {
  ev: [
    { name: 'Tata Power EV Charging Hub', city: 'Mumbai', address: 'Bandra Kurla Complex, Mumbai', lat: 19.0596, lng: 72.8656, rating: 4.3, link: 'https://maps.google.com/?q=Tata+Power+EV+Charging+BKC+Mumbai' },
    { name: 'Ather Grid Charging Station', city: 'Bengaluru', address: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, rating: 4.5, link: 'https://maps.google.com/?q=Ather+Grid+Indiranagar+Bengaluru' },
    { name: 'EESL EV Charging Point', city: 'Delhi', address: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167, rating: 4.1, link: 'https://maps.google.com/?q=EESL+EV+Charging+Connaught+Place+Delhi' },
    { name: 'ChargeZone Station', city: 'Pune', address: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8938, rating: 4.4, link: 'https://maps.google.com/?q=ChargeZone+Koregaon+Park+Pune' },
    { name: 'Fortum Charge & Drive', city: 'Chennai', address: 'Anna Salai, Chennai', lat: 13.0569, lng: 80.2425, rating: 4.2, link: 'https://maps.google.com/?q=Fortum+Charge+Anna+Salai+Chennai' },
    { name: 'Magenta ChargeGrid', city: 'Hyderabad', address: 'Hitech City, Hyderabad', lat: 17.4435, lng: 78.3772, rating: 4.0, link: 'https://maps.google.com/?q=Magenta+ChargeGrid+Hitech+City+Hyderabad' },
  ],
  parks: [
    { name: 'Sanjay Gandhi National Park', city: 'Mumbai', address: 'Borivali East, Mumbai', lat: 19.2147, lng: 72.9094, rating: 4.6, link: 'https://maps.google.com/?q=Sanjay+Gandhi+National+Park+Mumbai' },
    { name: 'Cubbon Park', city: 'Bengaluru', address: 'Kasturba Road, Bengaluru', lat: 12.9763, lng: 77.5929, rating: 4.7, link: 'https://maps.google.com/?q=Cubbon+Park+Bengaluru' },
    { name: 'Lodi Garden', city: 'Delhi', address: 'Lodi Road, New Delhi', lat: 28.5931, lng: 77.2199, rating: 4.6, link: 'https://maps.google.com/?q=Lodi+Garden+Delhi' },
    { name: 'Empress Botanical Garden', city: 'Pune', address: 'Bund Garden Rd, Pune', lat: 18.5389, lng: 73.8800, rating: 4.3, link: 'https://maps.google.com/?q=Empress+Botanical+Garden+Pune' },
    { name: 'Guindy National Park', city: 'Chennai', address: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206, rating: 4.4, link: 'https://maps.google.com/?q=Guindy+National+Park+Chennai' },
    { name: 'KBR National Park', city: 'Hyderabad', address: 'Jubilee Hills, Hyderabad', lat: 17.4239, lng: 78.4148, rating: 4.5, link: 'https://maps.google.com/?q=KBR+National+Park+Hyderabad' },
  ],
  organic: [
    { name: 'Sahakari Bhandar Organic', city: 'Mumbai', address: 'Dadar West, Mumbai', lat: 19.0178, lng: 72.8478, rating: 4.2, link: 'https://maps.google.com/?q=Sahakari+Bhandar+Organic+Dadar+Mumbai' },
    { name: 'Namdhari Fresh', city: 'Bengaluru', address: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, rating: 4.4, link: 'https://maps.google.com/?q=Namdhari+Fresh+Koramangala+Bengaluru' },
    { name: 'Organic India Store', city: 'Delhi', address: 'Khan Market, New Delhi', lat: 28.5999, lng: 77.2273, rating: 4.3, link: 'https://maps.google.com/?q=Organic+India+Store+Khan+Market+Delhi' },
    { name: 'Dorabjee & Co Organic', city: 'Pune', address: 'Camp Area, Pune', lat: 18.5205, lng: 73.8567, rating: 4.5, link: 'https://maps.google.com/?q=Dorabjee+Organic+Pune+Camp' },
    { name: 'Naturally Auroville', city: 'Chennai', address: 'R.A. Puram, Chennai', lat: 13.0300, lng: 80.2636, rating: 4.3, link: 'https://maps.google.com/?q=Naturally+Auroville+Chennai' },
    { name: 'Sresta Natural Bioproducts', city: 'Hyderabad', address: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347, rating: 4.1, link: 'https://maps.google.com/?q=Sresta+Natural+Banjara+Hills+Hyderabad' },
  ],
  recycle: [
    { name: 'Croma Recycling Point', city: 'Mumbai', address: 'Phoenix Mills, Lower Parel, Mumbai', lat: 18.9930, lng: 72.8264, rating: 4.0, link: 'https://maps.google.com/?q=Croma+Recycling+Lower+Parel+Mumbai' },
    { name: 'ITC WoW Recycling Centre', city: 'Bengaluru', address: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7499, rating: 4.2, link: 'https://maps.google.com/?q=ITC+WoW+Recycling+Whitefield+Bengaluru' },
    { name: 'Saahas Zero Waste', city: 'Delhi', address: 'Vasant Vihar, New Delhi', lat: 28.5573, lng: 77.1556, rating: 4.4, link: 'https://maps.google.com/?q=Saahas+Zero+Waste+Delhi' },
    { name: 'Encashea Recycling Hub', city: 'Pune', address: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143, rating: 4.3, link: 'https://maps.google.com/?q=Encashea+Recycling+Viman+Nagar+Pune' },
    { name: 'Kabadiwalla Connect', city: 'Chennai', address: 'Nungambakkam, Chennai', lat: 13.0604, lng: 80.2496, rating: 4.5, link: 'https://maps.google.com/?q=Kabadiwalla+Connect+Chennai' },
    { name: 'Recycle Green', city: 'Hyderabad', address: 'Kondapur, Hyderabad', lat: 17.4700, lng: 78.3544, rating: 4.1, link: 'https://maps.google.com/?q=Recycle+Green+Kondapur+Hyderabad' },
  ],
  cycle: [
    { name: 'Cycle Studio', city: 'Mumbai', address: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, rating: 4.5, link: 'https://maps.google.com/?q=Cycle+Studio+Bandra+Mumbai' },
    { name: 'B-Cycle Store', city: 'Bengaluru', address: 'Sadashivanagar, Bengaluru', lat: 13.0148, lng: 77.5741, rating: 4.6, link: 'https://maps.google.com/?q=B-Cycle+Sadashivanagar+Bengaluru' },
    { name: 'Hero Cycles Flagship', city: 'Delhi', address: 'Karol Bagh, New Delhi', lat: 28.6507, lng: 77.1900, rating: 4.3, link: 'https://maps.google.com/?q=Hero+Cycles+Karol+Bagh+Delhi' },
    { name: 'Decathlon Cycle Section', city: 'Pune', address: 'Nagar Road, Pune', lat: 18.5523, lng: 73.9128, rating: 4.5, link: 'https://maps.google.com/?q=Decathlon+Cycle+Pune+Nagar+Road' },
    { name: 'Firefox Bikes', city: 'Chennai', address: 'Anna Nagar, Chennai', lat: 13.0843, lng: 80.2101, rating: 4.4, link: 'https://maps.google.com/?q=Firefox+Bikes+Anna+Nagar+Chennai' },
    { name: 'Trek Bicycle Store', city: 'Hyderabad', address: 'Jubilee Hills, Hyderabad', lat: 17.4252, lng: 78.4122, rating: 4.6, link: 'https://maps.google.com/?q=Trek+Bicycle+Jubilee+Hills+Hyderabad' },
  ],
};

const PLACE_TYPES = [
  { id: 'ev',      label: 'EV Charging',    emoji: '🔌', type: 'electric_vehicle_charging_station', keyword: null },
  { id: 'parks',   label: 'Parks',           emoji: '🌳', type: 'park',                              keyword: null },
  { id: 'organic', label: 'Organic Stores',  emoji: '🥗', type: 'health',                            keyword: null },
  { id: 'recycle', label: 'Recycling',       emoji: '♻️', type: null,                               keyword: 'recycling center' },
  { id: 'cycle',   label: 'Cycle Stores',    emoji: '🚲', type: null,                               keyword: 'bicycle store' },
];

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#e8e0d0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dde2c6' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#a5b076' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f1e6' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8c967' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e9bc62' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#b9d3c2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#92998d' }] },
];

// ── Curated Place Card (fallback UI) ─────────────────────────────────────────
function PlaceCard({ place, emoji, index }) {
  return (
    <motion.a
      href={place.link}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card p-4 flex items-start gap-3 hover:shadow-xl transition-all duration-200 cursor-pointer group no-underline"
    >
      <div className="w-10 h-10 rounded-xl bg-forest-800/10 flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-forest-900 dark:text-cream-100 group-hover:text-forest-700 transition-colors">
          {place.name}
        </div>
        <div className="text-xs text-forest-700/60 dark:text-cream-200/50 mt-0.5">{place.address}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gold-500 font-semibold">⭐ {place.rating}</span>
          <span className="badge bg-forest-800/10 dark:bg-cream-100/10 text-forest-700 dark:text-cream-200 text-xs">
            {place.city}
          </span>
          <span className="text-xs text-forest-700/50 dark:text-cream-200/40 group-hover:text-forest-700 transition-colors">
            Get directions →
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function Map() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [activeType, setActiveType] = useState('ev');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapsKey = getMapsKey();

  // Load Maps script
  useEffect(() => {
    if (!mapsKey) { setUseFallback(true); return; }
    if (window.google?.maps) { initMap(); return; }

    const existing = document.querySelector('script[data-maps-key]');
    if (existing) { if (window.google?.maps) initMap(); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places,geometry`;
    script.async = true;
    script.setAttribute('data-maps-key', '1');
    script.onload = initMap;
    script.onerror = () => { setUseFallback(true); setApiError('Maps failed to load. Showing curated places instead.'); };
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsKey]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter, zoom: 5,
      styles: MAP_STYLE, mapTypeControl: false,
      streetViewControl: false, fullscreenControl: false,
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
    setMapReady(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(loc);
        mapInstance.current.setCenter(loc);
        mapInstance.current.setZoom(13);
        new window.google.maps.Marker({
          position: loc, map: mapInstance.current, title: 'You are here',
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#2d5016', fillOpacity: 1, strokeColor: '#F5F0E8', strokeWeight: 3 },
        });
        // Auto-search EV stations at user location
        searchNearbyLive({ id: 'ev', type: 'electric_vehicle_charging_station', keyword: null }, loc);
      }, () => {
        // No geolocation — show curated fallback
        setUseFallback(true);
      });
    } else {
      setUseFallback(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const searchNearbyLive = (placeType, center) => {
    if (!mapInstance.current || !window.google?.maps?.places) {
      setUseFallback(true); return;
    }
    setLoading(true);
    clearMarkers();

    const searchCenter = center || userPos || mapInstance.current.getCenter();
    const service = new window.google.maps.places.PlacesService(mapInstance.current);
    const request = {
      location: searchCenter, radius: 8000,
      ...(placeType.type ? { type: placeType.type } : { keyword: placeType.keyword }),
    };

    service.nearbySearch(request, (results, status) => {
      setLoading(false);
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results?.length) {
        // API returned nothing — show curated instead
        setUseFallback(true);
        setApiError('');
        return;
      }
      setUseFallback(false);
      setApiError('');

      results.slice(0, 15).forEach((place) => {
        const marker = new window.google.maps.Marker({
          position: place.geometry.location,
          map: mapInstance.current,
          title: place.name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z',
            fillColor: '#2d5016', fillOpacity: 1,
            strokeColor: '#F5F0E8', strokeWeight: 1.5, scale: 1.5,
            anchor: new window.google.maps.Point(12, 22),
          },
        });

        marker.addListener('click', () => {
          const userLatLng = userPos ? new window.google.maps.LatLng(userPos.lat, userPos.lng) : null;
          const dist = userLatLng && window.google.maps.geometry?.spherical
            ? `📍 ${(window.google.maps.geometry.spherical.computeDistanceBetween(userLatLng, place.geometry.location) / 1000).toFixed(1)} km away`
            : '';
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ' + (place.vicinity || ''))}`;
          infoWindowRef.current.setContent(`
            <div style="font-family:Inter,sans-serif;max-width:220px;">
              <h3 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a2e1a;">${place.name}</h3>
              ${place.rating ? `<div style="color:#DAA520;font-size:12px;margin-bottom:4px;">⭐ ${place.rating} (${place.user_ratings_total || 0})</div>` : ''}
              ${place.vicinity ? `<p style="margin:0 0 4px;font-size:12px;color:#555;">${place.vicinity}</p>` : ''}
              ${dist ? `<p style="margin:0 0 8px;font-size:12px;color:#2d5016;font-weight:600;">${dist}</p>` : ''}
              <a href="${mapsUrl}" target="_blank" rel="noreferrer" style="display:inline-block;background:#2d5016;color:#F5F0E8;padding:6px 12px;border-radius:8px;font-size:12px;text-decoration:none;font-weight:600;">🗺️ Get Directions</a>
            </div>
          `);
          infoWindowRef.current.open(mapInstance.current, marker);
        });
        markersRef.current.push(marker);
      });

      const bounds = new window.google.maps.LatLngBounds();
      results.slice(0, 15).forEach(p => bounds.extend(p.geometry.location));
      if (userPos) bounds.extend(userPos);
      mapInstance.current.fitBounds(bounds);
    });
  };

  const handleCategoryClick = (pt) => {
    setActiveType(pt.id);
    if (mapInstance.current && !useFallback) {
      searchNearbyLive(pt, null);
    }
    // Always update the fallback list for the selected category
  };

  const activePT = PLACE_TYPES.find(p => p.id === activeType);
  const curatedList = CURATED_PLACES[activeType] || [];

  return (
    <div className="min-h-screen pt-20 bg-cream-100 dark:bg-forest-900">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="font-display text-3xl font-bold text-forest-900 dark:text-cream-100">Eco Map 🗺️</h1>
          <p className="text-forest-700/60 dark:text-cream-200/50 text-sm mt-1">Find sustainable places near you</p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PLACE_TYPES.map((pt) => (
            <button
              key={pt.id}
              onClick={() => handleCategoryClick(pt)}
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${activeType === pt.id
                  ? 'bg-forest-800 text-cream-100 shadow-md'
                  : 'bg-forest-800/10 dark:bg-cream-100/10 text-forest-700 dark:text-cream-200 hover:bg-forest-800/20'
                }`}
            >
              <span>{pt.emoji}</span> {pt.label}
            </button>
          ))}
          {loading && <span className="flex items-center gap-1 text-sm text-forest-700/60 dark:text-cream-200/50">🌿 Searching…</span>}
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-sm">
            ℹ️ {apiError}
          </div>
        )}
      </div>

      {/* Map + Fallback layout */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Map (shown when API works) */}
        {mapsKey && !useFallback && (
          <div ref={mapRef} className="w-full rounded-2xl overflow-hidden mb-6" style={{ height: '420px' }} />
        )}

        {/* Curated places — always shown, labelled differently based on context */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{activePT?.emoji}</span>
            <div>
              <h2 className="font-display font-bold text-lg text-forest-900 dark:text-cream-100">
                {activePT?.label}
                {useFallback || !mapsKey ? ' — Recommended Places' : ' — Nearby + Curated'}
              </h2>
              <p className="text-xs text-forest-700/60 dark:text-cream-200/50">
                {useFallback || !mapsKey
                  ? 'Curated eco-friendly locations across major Indian cities'
                  : 'Live results from your area + our top picks'}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {curatedList.map((place, i) => (
              <PlaceCard key={place.name} place={place} emoji={activePT?.emoji} index={i} />
            ))}
          </div>
        </div>

        {/* If no Maps key, show info banner */}
        {!mapsKey && (
          <div className="mt-6 p-4 rounded-2xl bg-forest-800/10 dark:bg-cream-100/5 border border-forest-800/20 dark:border-cream-100/10 text-center">
            <p className="text-sm text-forest-700/70 dark:text-cream-200/60">
              🗺️ Add a Google Maps API key in <strong>Settings ⚙️</strong> to see live places near your location.
              The curated list above works without any API key.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
