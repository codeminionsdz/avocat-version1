"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LawyerQRCodeProps {
  url: string
  lawyerName: string
}

export function LawyerQRCode({ url, lawyerName }: LawyerQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Download as high-quality PNG
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = `${lawyerName.replace(/\s+/g, "_")}_Avoca_QR.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: "✅ QR Code Downloaded",
          description: "Your branded QR code is ready for print",
        })
      },
      "image/png",
      1.0
    )
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
          title: "✅ Shared Successfully",
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
          title: "🔗 Link Copied",
          description: "Profile link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "❌ Share Failed",
          description: "Unable to share profile",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3">
        {/* QR Code Canvas with Avoca Logo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100">
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={280}
            level="H" // High error correction for logo embedding
            includeMargin={true}
            imageSettings={{
              src: "/logo-avoca.png",
              height: 62, // 22% of 280px
              width: 62,
              excavate: true, // Clear QR data behind logo
            }}
            style={{ display: "block" }}
          />
        </div>
        
        {/* Professional Label */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{lawyerName}</p>
          <p className="text-xs text-gray-500">Scan to view profile</p>
        </div>
      </div>

      {/* Action Buttons */}
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