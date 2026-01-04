import { MobileShell } from "@/components/mobile-shell"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <MobileShell>
      <Header title="Check Your Email" showBack />
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">Thank you for signing up!</CardTitle>
            <CardDescription>Check your email to confirm your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account
              before signing in.
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  )
}
