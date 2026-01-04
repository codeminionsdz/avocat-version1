'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2, MessageSquare, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import type { LegalCategory, ConsultationType, ConsultationDuration } from '@/lib/database.types'

const CATEGORIES: { value: LegalCategory; label: string }[] = [
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'family', label: 'Family Law' },
  { value: 'civil', label: 'Civil Law' },
  { value: 'commercial', label: 'Commercial Law' },
  { value: 'administrative', label: 'Administrative Law' },
  { value: 'labor', label: 'Labor Law' },
  { value: 'immigration', label: 'Immigration Law' }
]

const CONSULTATION_TYPES: { value: ConsultationType; label: string; icon: any }[] = [
  { value: 'chat', label: 'Chat Consultation', icon: MessageSquare },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In-Person Meeting', icon: MapPin }
]

const DURATIONS: { value: ConsultationDuration; label: string }[] = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' }
]

interface RequestConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lawyerId: string
  lawyerName: string
}

export function RequestConsultationModal({
  open,
  onOpenChange,
  lawyerId,
  lawyerName
}: RequestConsultationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<LegalCategory>('criminal')
  const [consultationType, setConsultationType] = useState<ConsultationType>('chat')
  const [duration, setDuration] = useState<ConsultationDuration>(30)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('09:00')

  const handleSubmit = async () => {
    if (!description || description.length < 20) {
      toast({
        title: 'Description Required',
        description: 'Please provide at least 20 characters describing your legal issue',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      // Combine date and time if provided
      let requested_time = null
      if (date) {
        const [hours, minutes] = time.split(':')
        const datetime = new Date(date)
        datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        requested_time = datetime.toISOString()
      }

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          lawyer_id: lawyerId,
          category,
          description,
          consultation_type: consultationType,
          requested_duration: duration,
          requested_time
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send request' }))
        throw new Error(errorData.error || `Server error (${response.status})`)
      }

      // Success
      const result = await response.json()
      console.log('✅ Consultation request created:', result)
      
      toast({
        title: '✅ Request Sent Successfully',
        description: `Your consultation request has been sent to ${lawyerName}. You will be notified when the lawyer responds.`,
        duration: 5000,
      })
      
      // Reset form
      setDescription('')
      setDate(undefined)
      setCategory('criminal')
      setConsultationType('chat')
      setDuration(30)
      setTime('09:00')
      
      onOpenChange(false)
      
      // Navigate after a brief delay
      setTimeout(() => {
        router.push('/client/consultations')
      }, 500)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Consultation</DialogTitle>
          <DialogDescription>
            Send a consultation request to {lawyerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Legal Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as LegalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Consultation Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {CONSULTATION_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={consultationType === type.value ? 'default' : 'outline'}
                    className="h-auto py-3 px-2 flex flex-col items-center gap-2"
                    onClick={() => setConsultationType(type.value)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{type.label.split(' ')[0]}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration *</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as ConsultationDuration)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Date & Time (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMM dd, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Select value={time} onValueChange={setTime} disabled={!date}>
                <SelectTrigger>
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 9).map(hour => (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              The lawyer will confirm or suggest another time
            </p>
          </div>

          <div className="space-y-2">
            <Label>Describe Your Legal Issue *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about your legal issue..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length} characters (minimum 20)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
