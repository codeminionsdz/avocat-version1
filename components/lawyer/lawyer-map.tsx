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

interface LawyerMapProps {
  latitude: number
  longitude: number
  lawyerName: string
  officeAddress?: string | null
}

export function LawyerMap({ latitude, longitude, lawyerName, officeAddress }: LawyerMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<[number, number][] | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const { toast } = useToast()

  const officeLocation: [number, number] = [latitude, longitude]

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
      setMapReady(true)
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
        
        toast({
          title: "Route Calculated",
          description: `${distanceKm} km • ${durationMin} min`,
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
            
            {/* Office Marker */}
            <Marker position={officeLocation}>
              <Popup>
                <div className="text-center py-1">
                  <p className="font-semibold text-sm">{lawyerName}</p>
                  {officeAddress && (
                    <p className="text-xs text-muted-foreground mt-1">{officeAddress}</p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <p className="text-sm font-medium">Your Location</p>
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

      {/* Navigation Controls */}
      <div className="flex gap-2">
        {!userLocation ? (
          <Button
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            variant="outline"
            className="flex-1"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Get My Location
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={calculateRoute}
            disabled={isLoadingRoute}
            className="flex-1"
          >
            {isLoadingRoute ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : route ? (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Update Route
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Office
              </>
            )}
          </Button>
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
