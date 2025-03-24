"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, ShieldAlert, ShieldCheck, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import type { Tool } from "@/data/tools"

interface SideNavProps {
  tools: Tool[]
}

export function SideNav({ tools }: SideNavProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case "shield-alert":
        return <ShieldAlert className="h-4 w-4 text-primary" />
      case "shield-check":
        return <ShieldCheck className="h-4 w-4 text-primary" />
      default:
        return <Shield className="h-4 w-4 text-primary" />
    }
  }

  const navContent = (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">APK Security Tools</h2>
        <div className="space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname === "/" ? "bg-muted font-medium" : "text-muted-foreground",
            )}
            onClick={() => isMobile && setOpen(false)}
          >
            Home
          </Link>
          <h3 className="px-4 py-2 text-sm font-medium">Tools</h3>
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                pathname === `/tools/${tool.id}` ? "bg-muted font-medium" : "text-muted-foreground",
              )}
              onClick={() => isMobile && setOpen(false)}
            >
              {getToolIcon(tool.icon)}
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

  // Mobile view uses a sheet component
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              {navContent}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold">APK Security Analysis</div>
        </div>
        <div className="h-14 lg:hidden" />
      </>
    )
  }

  // Desktop view
  return <div className="hidden border-r bg-background lg:block lg:w-[240px] xl:w-[280px]">{navContent}</div>
}

