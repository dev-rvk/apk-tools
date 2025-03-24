"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalysisProgressProps {
  isAnalyzing: boolean
  toolName: string
}

export function AnalysisProgress({ isAnalyzing, toolName }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95 // Cap at 95% until analysis is complete
        }
        return prev + (95 - prev) * 0.1 // Gradually slow down as it approaches 95%
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isAnalyzing])

  // When analysis completes, set to 100% immediately
  useEffect(() => {
    if (!isAnalyzing && progress > 0) {
      setProgress(100)
    }
  }, [isAnalyzing, progress])

  if (!isAnalyzing && progress === 0) return null

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {isAnalyzing ? `Analyzing with ${toolName}...` : "Analysis complete"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 transition-all duration-300" />

        {isAnalyzing && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {["Decompiling APK", "Scanning for vulnerabilities", "Analyzing code patterns", "Generating report"].map(
              (step, index) => (
                <div
                  key={step}
                  className={`text-xs p-2 rounded-md text-center transition-colors duration-300 ${
                    progress > index * 25 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

