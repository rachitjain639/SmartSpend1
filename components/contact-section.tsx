'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mail, MessageSquare, Send, Sparkles, CheckCircle } from 'lucide-react'

export function ContactSection() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
      setFeedbackOpen(false)
    }, 2000)
  }

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reach Out to Us
            </h2>
            <p className="text-muted-foreground">
              Have questions, feedback, or need help? We are here for you!
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Support Card */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-violet/10 via-card to-card border border-violet/20 hover:border-violet/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-violet/10 group-hover:bg-violet/20 transition-colors">
                  <Mail className="h-6 w-6 text-violet" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get help with any issues or questions
                  </p>
                  <a 
                    href="mailto:support@smartspend.app" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet hover:text-violet/80 transition-colors"
                  >
                    support@smartspend.app
                    <Send className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Feedback Form Card */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald/10 via-card to-card border border-emerald/20 hover:border-emerald/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-emerald/5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald/10 group-hover:bg-emerald/20 transition-colors">
                      <MessageSquare className="h-6 w-6 text-emerald" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">Send Feedback</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Share your thoughts and suggestions
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald group-hover:text-emerald/80 transition-colors">
                        Open feedback form
                        <Sparkles className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-foreground">
                    <div className="p-2 rounded-xl bg-emerald/10">
                      <MessageSquare className="h-5 w-5 text-emerald" />
                    </div>
                    Send Us Feedback
                  </DialogTitle>
                </DialogHeader>
                
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald/10 mb-4">
                      <CheckCircle className="h-8 w-8 text-emerald" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your feedback has been submitted successfully.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-secondary border-border text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-secondary border-border text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-foreground">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us what you think..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-secondary border-border text-foreground min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald hover:bg-emerald/90 text-white h-12"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Feedback
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              SmartSpend - Track Your Expenses Smartly
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Built with care for Gen-Z by the SmartSpend Team
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
