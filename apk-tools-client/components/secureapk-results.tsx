"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, Info, CheckCircle, Code } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface SecureApkResultsProps {
  results: string
  filename: string
}

interface Vulnerability {
  type: string
  file: string
  line?: string
  details: string
  risk?: string
  severity: "critical" | "high" | "medium" | "low" | "info"
}

interface SoFileAnalysis {
  file: string
  issues: {
    type: string
    details: string
    severity: "critical" | "high" | "medium" | "low" | "info"
  }[]
}

export function SecureApkResults({ results, filename }: SecureApkResultsProps) {
  const [showAllResults, setShowAllResults] = useState(false)

  // Parse the results string into structured data
  const parseResults = (resultsString: string): { vulnerabilities: Vulnerability[]; soFiles: SoFileAnalysis[] } => {
    if (!resultsString) return { vulnerabilities: [], soFiles: [] }

    const lines = resultsString.split("\n")
    const vulnerabilities: Vulnerability[] = []
    const soFiles: SoFileAnalysis[] = []

    let currentSoFile: SoFileAnalysis | null = null
    let currentVulnerability: Partial<Vulnerability> | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines and dividers
      if (line === "" || line.startsWith("---")) continue

      // Skip lines about searching for vulnerabilities
      if (line.includes("Searching for vulnerabilities")) continue

      // Skip lines about analysis time
      if (line.includes("Analysis completed in") || line.includes("Analysis finished in")) continue

      // Check if this is the start of .so file analysis
      if (line.startsWith("[+] Analyzing ") && line.includes(".so")) {
        const file = line.replace("[+] Analyzing ", "").replace("...", "")
        currentSoFile = { file, issues: [] }
        soFiles.push(currentSoFile)
        continue
      }

      // Check if this is an .so file issue
      if (currentSoFile && (line.startsWith("[⚠]") || line.startsWith("[✓]") || line.startsWith("[✔]"))) {
        // Skip "Analysis complete" lines
        if (line.includes("Analysis complete")) continue

        // Parse the issue
        const severity = line.startsWith("[⚠]") ? "medium" : "info"
        const details = line.substring(4).trim()

        // Skip if it's just a completion message
        if (details.includes("Analysis finished")) continue

        // Add the issue to the current .so file
        currentSoFile.issues.push({
          type: details.split(":")[0].trim(),
          details,
          severity,
        })
        continue
      }

      // Check if this is the start of a new vulnerability
      if (line.startsWith("[!]")) {
        // Filter out false positives (http://schemas.android.com/)
        if (line.includes("http://schemas.android.com/")) {
          continue
        }

        // Parse the vulnerability
        const parts = line.substring(4).split(" detected in ")
        if (parts.length < 2) continue

        const type = parts[0].trim()
        const fileInfo = parts[1].split(" (line ")
        const file = fileInfo[0].trim()

        let lineNumber = ""
        let details = ""

        if (fileInfo.length > 1) {
          const lineAndDetails = fileInfo[1].split("): ")
          lineNumber = lineAndDetails[0].trim()
          details = lineAndDetails.length > 1 ? lineAndDetails[1].trim() : ""
        }

        currentVulnerability = {
          type,
          file,
          line: lineNumber,
          details,
          severity: determineSeverity(type),
        }
        continue
      }

      // Check if this is the exploitation risk for the current vulnerability
      if (line.startsWith("└ Exploitation Risk:") && currentVulnerability) {
        currentVulnerability.risk = line.replace("└ Exploitation Risk:", "").trim()

        // Add the completed vulnerability to the list
        vulnerabilities.push(currentVulnerability as Vulnerability)
        currentVulnerability = null
        continue
      }

      // Check if we found .so files
      if (line.startsWith("[+] Found") && line.includes(".so files")) {
        // Just a header, skip it
        continue
      }

      // If we reach here and have a current vulnerability, add it
      if (currentVulnerability && Object.keys(currentVulnerability).length > 0) {
        vulnerabilities.push(currentVulnerability as Vulnerability)
        currentVulnerability = null
      }
    }

    return { vulnerabilities, soFiles }
  }

  // Determine severity based on vulnerability type
  const determineSeverity = (type: string): "critical" | "high" | "medium" | "low" | "info" => {
    const lowercaseType = type.toLowerCase()

    if (
      lowercaseType.includes("private key") ||
      lowercaseType.includes("password") ||
      lowercaseType.includes("token") ||
      lowercaseType.includes("sql injection")
    ) {
      return "critical"
    }

    if (lowercaseType.includes("hardcoded") || lowercaseType.includes("insecure") || lowercaseType.includes("weak")) {
      return "high"
    }

    if (lowercaseType.includes("debug") || lowercaseType.includes("obfuscated")) {
      return "medium"
    }

    if (lowercaseType.includes("http url")) {
      return "low"
    }

    return "medium" // Default severity
  }

  const { vulnerabilities, soFiles } = parseResults(results)

  // Group vulnerabilities by type
  const vulnerabilityTypes = [...new Set(vulnerabilities.map((v) => v.type))]

  // Count vulnerabilities by severity
  const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
  const highCount = vulnerabilities.filter((v) => v.severity === "high").length
  const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length
  const lowCount = vulnerabilities.filter((v) => v.severity === "low").length
  const soIssuesCount = soFiles.reduce((count, file) => count + file.issues.length, 0)

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
            {soIssuesCount > 0 && (
              <Badge variant="outline" className="border-purple-200 bg-purple-100 text-purple-800">
                {soIssuesCount} Native
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vulnerabilities.length === 0 && soFiles.length === 0 ? (
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
                  Found {vulnerabilities.length + soIssuesCount} potential security issues in the APK
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="by-severity">By Severity</TabsTrigger>
                  <TabsTrigger value="by-type">By Vulnerability Type</TabsTrigger>
                  <TabsTrigger value="native-code">Native Code Issues</TabsTrigger>
                </TabsList>

                <TabsContent value="by-severity" className="mt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {["critical", "high", "medium", "low"].map((severity) => {
                      const severityVulnerabilities = vulnerabilities.filter((v) => v.severity === severity)
                      if (severityVulnerabilities.length === 0) return null

                      return (
                        <div key={severity} className="mb-6">
                          <h3 className="flex items-center gap-2 text-lg font-medium mb-3 capitalize">
                            {getSeverityIcon(severity)}
                            {severity} Issues ({severityVulnerabilities.length})
                          </h3>
                          <div className="space-y-3">
                            {severityVulnerabilities.map((vulnerability, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${getSeverityColor(severity)} transition-all hover:shadow-sm`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{vulnerability.type}</div>
                                  <Badge variant={getSeverityBadgeVariant(severity)} className="capitalize">
                                    {severity}
                                  </Badge>
                                </div>
                                <div className="text-sm mt-1 text-muted-foreground">
                                  <span className="font-medium">File:</span> {vulnerability.file}
                                  {vulnerability.line && <span className="ml-1">(line {vulnerability.line})</span>}
                                </div>
                                {vulnerability.details && (
                                  <div className="text-sm mt-1 text-muted-foreground">
                                    <span className="font-medium">Details:</span> {vulnerability.details}
                                  </div>
                                )}
                                {vulnerability.risk && (
                                  <div className="text-sm mt-2 text-red-600">
                                    <span className="font-medium">Risk:</span> {vulnerability.risk}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="by-type" className="mt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {vulnerabilityTypes.map((type) => {
                      const typeVulnerabilities = vulnerabilities.filter((v) => v.type === type)
                      return (
                        <div key={type} className="mb-6">
                          <h3 className="text-lg font-medium mb-3">
                            {type}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              ({typeVulnerabilities.length} issues)
                            </span>
                          </h3>
                          <div className="space-y-3">
                            {typeVulnerabilities.map((vulnerability, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${getSeverityColor(vulnerability.severity)} transition-all hover:shadow-sm`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{vulnerability.file.split("/").pop()}</div>
                                  <Badge
                                    variant={getSeverityBadgeVariant(vulnerability.severity)}
                                    className="capitalize"
                                  >
                                    {vulnerability.severity}
                                  </Badge>
                                </div>
                                <div className="text-sm mt-1 text-muted-foreground">
                                  <span className="font-medium">File:</span> {vulnerability.file}
                                  {vulnerability.line && <span className="ml-1">(line {vulnerability.line})</span>}
                                </div>
                                {vulnerability.details && (
                                  <div className="text-sm mt-1 text-muted-foreground">
                                    <span className="font-medium">Details:</span> {vulnerability.details}
                                  </div>
                                )}
                                {vulnerability.risk && (
                                  <div className="text-sm mt-2 text-red-600">
                                    <span className="font-medium">Risk:</span> {vulnerability.risk}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="native-code" className="mt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {soFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Code className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No native code files found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          This APK does not contain any .so files for analysis
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {soFiles.map((soFile, index) => (
                          <Accordion type="single" collapsible key={index}>
                            <AccordionItem value={`so-file-${index}`} className="border-b-0">
                              <AccordionTrigger className="py-2 px-3 rounded-md bg-muted/50 hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <Code className="h-4 w-4 text-primary" />
                                  <span>{soFile.file.split("/").pop()}</span>
                                  <Badge className="ml-2">{soFile.issues.length} issues</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-3">
                                <div className="space-y-3">
                                  {soFile.issues.map((issue, issueIndex) => (
                                    <div
                                      key={issueIndex}
                                      className={`p-3 rounded-md border ${getSeverityColor(issue.severity)} transition-all hover:shadow-sm`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="font-medium">{issue.type}</div>
                                        <Badge variant={getSeverityBadgeVariant(issue.severity)} className="capitalize">
                                          {issue.severity}
                                        </Badge>
                                      </div>
                                      <div className="text-sm mt-1 text-muted-foreground">{issue.details}</div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                {/* Summary of vulnerabilities by severity */}
                {["critical", "high", "medium", "low"].map((severity) => {
                  const severityVulnerabilities = vulnerabilities.filter((v) => v.severity === severity)
                  if (severityVulnerabilities.length === 0) return null

                  return (
                    <div key={severity} className="p-4 rounded-lg border transition-all hover:shadow-sm">
                      <h3 className="flex items-center gap-2 text-lg font-medium mb-3 capitalize">
                        {getSeverityIcon(severity)}
                        {severity} Issues ({severityVulnerabilities.length})
                      </h3>
                      <div className="space-y-2">
                        {severityVulnerabilities.slice(0, 3).map((vulnerability, index) => (
                          <div key={index} className="text-sm">
                            • {vulnerability.type} in {vulnerability.file.split("/").pop()}
                          </div>
                        ))}
                        {severityVulnerabilities.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            + {severityVulnerabilities.length - 3} more {severity} issues
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Summary of native code issues */}
                {soFiles.length > 0 && (
                  <div className="p-4 rounded-lg border transition-all hover:shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
                      <Code className="h-4 w-4 text-primary" />
                      Native Code Issues ({soIssuesCount})
                    </h3>
                    <div className="space-y-2">
                      {soFiles.map((soFile, index) => (
                        <div key={index} className="text-sm">
                          • {soFile.file.split("/").pop()}: {soFile.issues.length} issues detected
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

