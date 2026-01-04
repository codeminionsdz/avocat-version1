"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LawyerQRCodeProps {
  url: string
  lawyerName: string
}

export function LawyerQRCode({ url, lawyerName }: LawyerQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const downloadQRCode = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    // Convert SVG to canvas
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    canvas.width = 300
    canvas.height = 300

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300)
      
      // Download as PNG
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = `${lawyerName.replace(/\s+/g, "_")}_QR_Code.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: "QR Code Downloaded",
          description: "Your QR code has been saved successfully",
        })
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${lawyerName} - Avoca Profile`,
          text: `Check out ${lawyerName}'s professional profile on Avoca`,
          url: url,
        })
        toast({
          title: "Shared Successfully",
          description: "Profile link has been shared",
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link Copied",
          description: "Profile link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share profile",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div ref={qrRef} className="flex justify-center bg-white p-4 rounded-lg">
        <QRCodeSVG
          value={url}
          size={200}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/favicon.ico",
            height: 30,
            width: 30,
            excavate: true,
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadQRCode}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={shareQRCode}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )
}
