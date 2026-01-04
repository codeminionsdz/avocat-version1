"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

export default function AvailabilitySchedulePage() {
  return (
    <div className="min-h-screen pb-24">
      <Header title="Availability Schedule" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Coming Soon Card */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <Clock className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
            <h2 className="text-lg font-semibold text-foreground mt-2">Advanced Scheduling</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Set your weekly availability, working hours, and time slots for consultations. 
              This feature will be available in an upcoming update.
            </p>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <Card className="opacity-60">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preview Features:</p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Set weekly working hours
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Define time slot intervals
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Block specific dates
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Automatic calendar sync
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
