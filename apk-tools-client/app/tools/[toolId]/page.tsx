"use client"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { FileUpload } from "@/components/file-upload"
import { OptionsSection } from "@/components/options-section"
import { AnalysisPlaceholder } from "@/components/analysis-placeholder"
import { AnalysisProgress } from "@/components/analysis-progress"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { tools, getTool } from "@/data/tools"
import { notFound } from "next/navigation"

export default function ToolPage({ params }: { params: { toolId: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find the current tool
  const currentTool = getTool(params.toolId)

  // If tool not found, show 404
  if (!currentTool) {
    notFound()
  }

  // If it's a special tool with its own dedicated page, redirect to that page
  // This approach avoids the notFound() for tools that actually exist but have dedicated pages
  if (currentTool.id === "reconizex" || currentTool.id === "secureapk") {
    // We'll handle these tools in their dedicated pages
    // This code should never execute because Next.js will prioritize
    // the dedicated page routes (/tools/reconizex and /tools/secureapk)
    // over the dynamic route, but we'll keep it as a fallback
    return null
  }

  // Example options - these would be specific to each tool
  const options = [
    {
      id: "option1",
      label: "Basic Security Scan",
      description: "Perform a basic security scan of the APK",
    },
    {
      id: "option2",
      label: "Deep Analysis",
      description: "Perform a deep analysis of the APK (takes longer)",
    },
    {
      id: "option3",
      label: "Check for Vulnerabilities",
      description: "Check for known vulnerabilities in the APK",
    },
    {
      id: "option4",
      label: "Generate Report",
      description: "Generate a detailed report of the analysis",
    },
  ]

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
  }

  const handleOptionsChange = (options: string[]) => {
    setSelectedOptions(options)
  }

  const handleAnalyze = () => {
    if (!file) {
      setError("Please upload an APK file first")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      // The actual analysis results would be displayed in the analysis component
    }, 3000)
  }

  return (
    <div className="flex min-h-screen">
      <SideNav tools={tools} />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{currentTool.name}</h1>
          <p className="text-muted-foreground">{currentTool.description}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload APK</h2>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            <OptionsSection options={options} onChange={handleOptionsChange} />
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleAnalyze} disabled={!file || isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze APK"}
            </Button>
          </div>

          <AnalysisProgress isAnalyzing={isAnalyzing} toolName={currentTool.name} />

          <AnalysisPlaceholder isAnalyzing={isAnalyzing} toolName={currentTool.name} />
        </div>
      </main>
    </div>
  )
}

