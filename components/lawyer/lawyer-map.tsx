"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation, MapPin, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

// Create custom icons function - will be called after Leaflet loads
const createCustomIcons = () => {
  if (typeof window === "undefined") return { lawyerIcon: undefined, userIcon: undefined }
  
  try {
    const L = require("leaflet")
    
    // Fix default icon issue with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })

    // Create custom icons with different colors
    const lawyerIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    const userIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
    
    return { lawyerIcon, userIcon }
  } catch (error) {
    console.error("Error creating custom icons:", error)
    return { lawyerIcon: undefined, userIcon: undefined }
  }
}

interface LawyerMapProps {
  latitude: number
  longitude: number
  lawyerName: string
  officeAddress?: string | null
}

export function LawyerMap({ latitude, longitude, lawyerName, officeAddress }: LawyerMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][] | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [icons, setIcons] = useState<{ lawyerIcon: any, userIcon: any }>({ lawyerIcon: undefined, userIcon: undefined })
  const { toast } = useToast()

  const officeLocation: [number, number] = [latitude, longitude]

  useEffect(() => {
    // Load Leaflet CSS and initialize icons
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
      
      // Create icons after a short delay to ensure Leaflet is loaded
      setTimeout(() => {
        const customIcons = createCustomIcons()
        setIcons(customIcons)
        setMapReady(true)
      }, 100)
      
      // Auto-request location for better QR scan UX
      setTimeout(() => {
        getUserLocation()
      }, 1500)
    }
  }, [])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      })
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ]
        setUserLocation(userCoords)
        setIsLoadingLocation(false)
        toast({
          title: "Location Found",
          description: "Your location has been detected",
        })
      },
      (error) => {
        setIsLoadingLocation(false)
        let errorMessage = "Unable to get your location"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        
        setLocationError(errorMessage)
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const calculateRoute = async () => {
    if (!userLocation) {
      getUserLocation()
      return
    }

    setIsLoadingRoute(true)

    try {
      // Use OSRM (Open Source Routing Machine) for routing
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${longitude},${latitude}?overview=full&geometries=geojson`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        )
        setRoute(coordinates)
        
        const distanceKm = (data.routes[0].distance / 1000).toFixed(1)
        const durationMin = Math.round(data.routes[0].duration / 60)
        
        setDistance(`${distanceKm} km`)
        setDuration(`${durationMin} min`)
        
        toast({
          title: "🗺️ Route Calculated",
          description: `${distanceKm} km • ${durationMin} min drive`,
        })
      } else {
        throw new Error("Unable to calculate route")
      }
    } catch (error) {
      console.error("Route calculation error:", error)
      toast({
        title: "Route Error",
        description: "Unable to calculate route. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRoute(false)
    }
  }

  if (!mapReady) {
    return (
      <Card className="w-full h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-3" data-map-container>
      <Card className="overflow-hidden">
        <div className="h-[300px] w-full relative">
          <MapContainer
            center={officeLocation}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Office Marker - Red */}
            <Marker position={officeLocation} icon={icons.lawyerIcon}>
              <Popup>
                <div className="text-center py-1">
                  <p className="font-semibold text-sm">🏛️ {lawyerName}</p>
                  {officeAddress && (
                    <p className="text-xs text-muted-foreground mt-1">{officeAddress}</p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* User Location Marker - Blue */}
            {userLocation && (
              <Marker position={userLocation} icon={icons.userIcon}>
                <Popup>
                  <p className="text-sm font-medium">📍 Your Location</p>
                </Popup>
              </Marker>
            )}

            {/* Route Polyline */}
            {route && (
              <Polyline
                positions={route}
                color="#3b82f6"
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>
        </div>
      </Card>

      {/* Route Information */}
      {route && distance && duration && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Route Info</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {distance} • {duration} drive
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="space-y-2">
        {!userLocation ? (
          <Button
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            size="lg"
            className="w-full h-12 text-base"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Getting Your Location...
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5 mr-2" />
                📍 Get My Location
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              variant="outline"
              size="lg"
              className="flex-1 h-12"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Update
            </Button>
            <Button
              onClick={calculateRoute}
              disabled={isLoadingRoute}
              size="lg"
              className="flex-[2] h-12 text-base"
            >
              {isLoadingRoute ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : route ? (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  🗺️ Update Route
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  🗺️ Show Route
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {locationError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{locationError}</span>
        </div>
      )}
    </div>
  )
}
