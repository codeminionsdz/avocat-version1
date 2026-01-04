import { Scale } from "lucide-react"

interface AvocaLogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
}

export function AvocaLogo({ size = "md", variant = "default" }: AvocaLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }

  const textColor = variant === "white" ? "text-white" : "text-primary"

  return (
    <div className={`flex items-center gap-2 ${textColor}`}>
      <span className={`font-bold tracking-tight ${sizeClasses[size]}`}>avoca</span>
      <Scale className={iconSizes[size]} />
    </div>
  )
}
