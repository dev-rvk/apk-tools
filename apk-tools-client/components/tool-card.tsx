"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import Link from "next/link"
import type { Tool } from "@/data/tools"

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  // Function to determine which icon to use based on the tool's icon property
  const getIcon = () => {
    switch (tool.icon) {
      case "shield-alert":
        return <ShieldAlert className="h-5 w-5 text-primary" />
      case "shield-check":
        return <ShieldCheck className="h-5 w-5 text-primary" />
      default:
        return <Shield className="h-5 w-5 text-primary" />
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle>{tool.name}</CardTitle>
        </div>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-4 flex-grow">
        <p className="text-sm text-muted-foreground">{tool.shortDescription}</p>
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
        <Link href={`/tools/${tool.id}`} className="w-full">
          <Button className="w-full">Analyze</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

