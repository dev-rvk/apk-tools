"use client"

import { useState, useCallback } from "react"
import { SideNav } from "@/components/side-nav"
import { FileUpload } from "@/components/file-upload"
import { AnalysisResults } from "@/components/analysis-results"
import { AnalysisPlaceholder } from "@/components/analysis-placeholder"
import { AnalysisProgress } from "@/components/analysis-progress"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { tools, getTool } from "@/data/tools"

export default function ReconizeXPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<{ 
    filename: string; 
    results: string;
    completed: boolean;
  } | null>(null)

  const tool = getTool("reconizex")!

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setAnalysisResults(null)
  }, [])

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload an APK file first")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("apk", file)      
      if (!tool.apiEndpoint) {
        throw new Error('API endpoint is not defined')
      }

      const response = await fetch(tool.apiEndpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to analyze APK')
      }
      
      const data = await response.json()
      setAnalysisResults(data)
      setIsAnalyzing(false) // Ensure isAnalyzing is set to false when analysis completes successfully
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsAnalyzing(false) // Ensure isAnalyzing is set to false even if there's an error
    }
  }

  return (
    <div className="flex min-h-screen">
      <SideNav tools={tools} />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
          <p className="text-muted-foreground">{tool.description}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="features">
              <AccordionTrigger>Features & Capabilities</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {tool.categories?.map((category) => (
                    <div key={category.name}>
                      <h4 className="font-medium mb-2">{category.name}</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {category.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    These templates are derived from open-source mobile-nuclei-templates by Optiv Security and
                    @0xgaurang. This App is inspired from{" "}
                    <a
                      href="https://github.com/utkarsh24122/apknuke"
                      className="text-primary hover:underline inline-flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      apknuke <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
            <h2 className="text-xl font-semibold mb-4">Upload APK</h2>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleAnalyze} disabled={!file || isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze APK"}
            </Button>
          </div>

          {/* Only show AnalysisProgress when isAnalyzing is true and there are no results yet */}
          {isAnalyzing && !analysisResults && (
            <AnalysisProgress isAnalyzing={isAnalyzing} toolName={tool.name} />
          )}

          {analysisResults && !analysisResults.completed && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Partial Analysis</AlertTitle>
              <AlertDescription>
                The complete APK could not be processed. Showing available vulnerability results.
              </AlertDescription>
            </Alert>
          )}

          {analysisResults ? (
            <AnalysisResults 
              results={analysisResults.results} 
              filename={analysisResults.filename} 
            />
          ) : (
            <AnalysisPlaceholder isAnalyzing={isAnalyzing} toolName={tool.name} />
          )}
        </div>
      </main>
    </div>
  )
}

