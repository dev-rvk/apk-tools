'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AnalysisPlaceholderProps {
  isAnalyzing?: boolean
  toolName: string
}

export function AnalysisPlaceholder({ isAnalyzing = false, toolName }: AnalysisPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Analysis Results
          {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing APK with {toolName}...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">Upload an APK file and select analysis options to begin</p>
            <p className="text-xs text-muted-foreground">Results will appear here after analysis is complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

