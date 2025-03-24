"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalysisResult {
  type: string
  fileType: string
  severity: string
  path: string
}

interface AnalysisResultsProps {
  results: string
  filename: string
}

export function AnalysisResults({ results, filename }: AnalysisResultsProps) {
  const [showAllResults, setShowAllResults] = useState(false)

  // Parse the results string into structured data
  const parseResults = (resultsString: string): AnalysisResult[] => {
    if (!resultsString) return []

    return resultsString
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        // Format: [type] [fileType] [severity] path
        const match = line.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)/)
        if (match) {
          return {
            type: match[1],
            fileType: match[2],
            severity: match[3],
            path: match[4],
          }
        }
        return {
          type: "unknown",
          fileType: "unknown",
          severity: "unknown",
          path: line,
        }
      })
  }

  const parsedResults = parseResults(results)

  // Group results by severity
  const groupedResults = parsedResults.reduce(
    (acc, result) => {
      const severity = result.severity
      if (!acc[severity]) {
        acc[severity] = []
      }
      acc[severity].push(result)
      return acc
    },
    {} as Record<string, AnalysisResult[]>,
  )

  // Count results by severity
  const criticalCount = groupedResults["critical"]?.length || 0
  const highCount = groupedResults["high"]?.length || 0
  const mediumCount = groupedResults["medium"]?.length || 0
  const lowCount = groupedResults["low"]?.length || 0
  const totalIssues = parsedResults.length

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  // Get badge variant based on severity
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "outline"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "outline"
    }
  }

  // Group results by vulnerability type
  const vulnerabilityTypes = [...new Set(parsedResults.map((result) => result.type))]

  return (
    <Card className="animate-in fade-in-50 duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analysis Results</span>
          <div className="flex gap-2">
            {criticalCount > 0 && <Badge variant="destructive">{criticalCount} Critical</Badge>}
            {highCount > 0 && (
              <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-800">
                {highCount} High
              </Badge>
            )}
            {mediumCount > 0 && <Badge variant="secondary">{mediumCount} Medium</Badge>}
            {lowCount > 0 && <Badge>{lowCount} Low</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parsedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">No issues found</p>
            <p className="text-sm text-muted-foreground mt-2">The APK passed all security checks</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="text-lg font-medium">Summary for {filename}</h3>
                <p className="text-sm text-muted-foreground">
                  Found {totalIssues} potential security issues in the APK
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAllResults(!showAllResults)}
                className="transition-all duration-300 hover:bg-primary/10"
              >
                {showAllResults ? "Show Summary" : "Show All Results"}
              </Button>
            </div>

            {showAllResults ? (
              <Tabs defaultValue="by-severity" className="animate-in fade-in-50 duration-300">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="by-severity">By Severity</TabsTrigger>
                  <TabsTrigger value="by-type">By Vulnerability Type</TabsTrigger>
                </TabsList>

                <TabsContent value="by-severity" className="mt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {["critical", "high", "medium", "low"].map(
                      (severity) =>
                        groupedResults[severity] &&
                        groupedResults[severity].length > 0 && (
                          <div key={severity} className="mb-6">
                            <h3 className="flex items-center gap-2 text-lg font-medium mb-3 capitalize">
                              {getSeverityIcon(severity)}
                              {severity} Issues ({groupedResults[severity].length})
                            </h3>
                            <div className="space-y-3">
                              {groupedResults[severity].map((result, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-md border ${getSeverityColor(severity)} transition-all hover:shadow-sm`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">
                                      {result.type.replace(/android-|android-smali-|-strict/g, "").replace(/-/g, " ")}
                                    </div>
                                    <Badge variant={getSeverityBadgeVariant(severity)} className="capitalize">
                                      {severity}
                                    </Badge>
                                  </div>
                                  <div className="text-sm mt-1 text-muted-foreground break-all">{result.path}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="by-type" className="mt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {vulnerabilityTypes.map((type) => {
                      const typeResults = parsedResults.filter((result) => result.type === type)
                      return (
                        <div key={type} className="mb-6">
                          <h3 className="text-lg font-medium mb-3">
                            {type.replace(/android-|android-smali-|-strict/g, "").replace(/-/g, " ")}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              ({typeResults.length} issues)
                            </span>
                          </h3>
                          <div className="space-y-3">
                            {typeResults.map((result, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${getSeverityColor(result.severity)} transition-all hover:shadow-sm`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{result.path.split("/").pop()}</div>
                                  <Badge variant={getSeverityBadgeVariant(result.severity)} className="capitalize">
                                    {result.severity}
                                  </Badge>
                                </div>
                                <div className="text-sm mt-1 text-muted-foreground break-all">{result.path}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                {["critical", "high", "medium", "low"].map(
                  (severity) =>
                    groupedResults[severity] &&
                    groupedResults[severity].length > 0 && (
                      <div key={severity} className="p-4 rounded-lg border transition-all hover:shadow-sm">
                        <h3 className="flex items-center gap-2 text-lg font-medium mb-3 capitalize">
                          {getSeverityIcon(severity)}
                          {severity} Issues ({groupedResults[severity].length})
                        </h3>
                        <div className="space-y-2">
                          {groupedResults[severity].slice(0, 3).map((result, index) => (
                            <div key={index} className="text-sm">
                              • {result.type.replace(/android-|android-smali-|-strict/g, "").replace(/-/g, " ")}
                            </div>
                          ))}
                          {groupedResults[severity].length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              + {groupedResults[severity].length - 3} more {severity} issues
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

