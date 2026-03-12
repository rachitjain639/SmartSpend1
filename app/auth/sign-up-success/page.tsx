import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logo.png"
            alt="SmartSpend Logo"
            width={80}
            height={80}
            className="rounded-xl"
          />
        </div>

        {/* Success Card */}
        <Card className="bg-card border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl text-foreground">Check your email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve sent you a confirmation link to verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">Verification required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the link in the email we sent to confirm your account and start tracking your expenses.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <Link href="/auth/sign-up" className="text-primary hover:text-primary/80">
                  try again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
