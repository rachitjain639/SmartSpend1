'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Settings, Bell, Smartphone } from 'lucide-react'

interface ReminderSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ReminderConfig {
  autoReminders: boolean
  frequency: 'daily' | 'every_2_days' | 'weekly'
  enableSMS: boolean
  enablePush: boolean
  muteUntil?: Date
}

export function ReminderSettings({ open, onOpenChange }: ReminderSettingsProps) {
  const [config, setConfig] = useState<ReminderConfig>({
    autoReminders: true,
    frequency: 'daily',
    enableSMS: false,
    enablePush: true
  })

  const handleSave = () => {
    // Save to localStorage or context
    localStorage.setItem('reminderConfig', JSON.stringify(config))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Reminder Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-border p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-card">
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-card">
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Auto Send Reminders</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically send reminders for pending splits
                  </p>
                </div>
                <Switch
                  checked={config.autoReminders}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, autoReminders: checked })
                  }
                />
              </div>

              {config.autoReminders && (
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Reminder Frequency</Label>
                  <Select value={config.frequency} onValueChange={(v) =>
                    setConfig({
                      ...config,
                      frequency: v as 'daily' | 'every_2_days' | 'weekly'
                    })
                  }>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_2_days">Every 2 Days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <Label className="text-foreground font-medium">Push Notifications</Label>
                </div>
                <Switch
                  checked={config.enablePush}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enablePush: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <Label className="text-foreground font-medium">SMS Notifications</Label>
                </div>
                <Switch
                  checked={config.enableSMS}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, enableSMS: checked })
                  }
                />
              </div>

              <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                Enable SMS to receive payment reminders as text messages. Standard messaging rates may apply.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
