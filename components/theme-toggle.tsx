'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="border-border">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="border-border hover:bg-secondary transition-all duration-200"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-violet" />
          ) : (
            <Sun className="h-4 w-4 text-coral" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`gap-2 cursor-pointer ${theme === 'light' ? 'bg-secondary' : ''}`}
        >
          <Sun className="h-4 w-4 text-coral" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`gap-2 cursor-pointer ${theme === 'dark' ? 'bg-secondary' : ''}`}
        >
          <Moon className="h-4 w-4 text-violet" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`gap-2 cursor-pointer ${theme === 'system' ? 'bg-secondary' : ''}`}
        >
          <Monitor className="h-4 w-4 text-teal" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle
