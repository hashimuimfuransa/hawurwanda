import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  salons: any[];
  onSalonSelect: (salon: any) => void;
  selectedSalon?: any;
  className?: string;
}

const MapComponent: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  salons: any[];
  onSalonSelect: (salon: any) => void;
  selectedSalon?: any;
}> = ({ center, zoom, salons, onSalonSelect, selectedSalon }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new markers
      const newMarkers = salons.map(salon => {
        // Create custom marker with salon image
        const markerIcon = salon.gallery && salon.gallery.length > 0 
          ? {
              url: salon.gallery[0],
              scaledSize: new google.maps.Size(60, 60),
              anchor: new google.maps.Point(30, 60)
            }
          : {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                  </defs>
                  <circle cx="30" cy="30" r="28" fill="#4F46E5" stroke="#ffffff" stroke-width="3" filter="url(#shadow)"/>
                  <text x="30" y="38" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">S</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(60, 60),
              anchor: new google.maps.Point(30, 60)
            };

        const marker = new google.maps.Marker({
          position: { lat: salon.latitude, lng: salon.longitude },
          map,
          title: salon.name,
          icon: markerIcon
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                ${salon.gallery && salon.gallery.length > 0 
                  ? `<img src="${salon.gallery[0]}" alt="${salon.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />`
                  : `<div style="width: 50px; height: 50px; border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><span style="color: white; font-weight: bold; font-size: 18px;">${salon.name.charAt(0)}</span></div>`
                }
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #1f2937; line-height: 1.2;">${salon.name}</h4>
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="color: #fbbf24; font-size: 12px;">★★★★★</span>
                    <span style="margin-left: 4px; font-size: 12px; color: #6b7280;">4.8</span>
                  </div>
                </div>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.3;">${salon.address}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 12px; font-size: 11px; color: #9ca3af;">
                  <span>👥 ${salon.barbers?.length || 0} stylists</span>
                  <span>⚡ ${salon.services?.length || 0} services</span>
                </div>
                <button 
                  onclick="window.selectSalon('${salon._id}')"
                  style="
                    background: linear-gradient(135deg, #4f46e5, #7c3aed); 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 6px; 
                    font-size: 12px; 
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
                  "
                  onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(79, 70, 229, 0.4)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(79, 70, 229, 0.3)'"
                >
                  View Details
                </button>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          onSalonSelect(salon);
          infoWindow.open(map, marker);
        });

        // Highlight selected salon
        if (selectedSalon && selectedSalon._id === salon._id) {
          const selectedIcon = salon.gallery && salon.gallery.length > 0 
            ? {
                url: salon.gallery[0],
                scaledSize: new google.maps.Size(70, 70),
                anchor: new google.maps.Point(35, 70)
              }
            : {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="selectedShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(220, 38, 38, 0.5)"/>
                      </filter>
                    </defs>
                    <circle cx="35" cy="35" r="32" fill="#DC2626" stroke="#ffffff" stroke-width="4" filter="url(#selectedShadow)"/>
                    <text x="35" y="43" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">S</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(70, 70),
                anchor: new google.maps.Point(35, 70)
              };
          marker.setIcon(selectedIcon);
        }

        return marker;
      });

      setMarkers(newMarkers);

      // Add global function for info window buttons
      (window as any).selectSalon = (salonId: string) => {
        const salon = salons.find(s => s._id === salonId);
        if (salon) {
          onSalonSelect(salon);
          // Navigate to salon details page
          window.location.href = `/salons/${salonId}`;
        }
      };
    }
  }, [map, salons, onSalonSelect, selectedSalon]);

  useEffect(() => {
    if (map && selectedSalon) {
      map.panTo({ lat: selectedSalon.latitude, lng: selectedSalon.longitude });
      map.setZoom(15);
    }
  }, [map, selectedSalon]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full text-red-600">
          <div className="text-center">
            <p className="text-sm">Failed to load map</p>
            <p className="text-xs text-gray-500">Please check your internet connection</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  salons,
  onSalonSelect,
  selectedSalon,
  className = ''
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-600">
          <p className="text-sm font-medium">Google Maps API Key Required</p>
          <p className="text-xs text-gray-500 mt-1">
            Please add VITE_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent
          center={center}
          zoom={zoom}
          salons={salons}
          onSalonSelect={onSalonSelect}
          selectedSalon={selectedSalon}
        />
      </Wrapper>
    </div>
  );
};

export default GoogleMap;
