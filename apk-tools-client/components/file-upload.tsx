"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, FileType } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({ onFileSelect, accept = ".apk", maxSize = 100 }: FileUploadProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)

  const validateFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return false

    if (!selectedFile.name.endsWith(".apk")) {
      setError("Only APK files are allowed")
      return false
    }

    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    return true
  }, [maxSize])

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setError(null)
    if (!selectedFile) return

    if (validateFile(selectedFile)) {
      setInternalFile(selectedFile)
      setIsUploading(true)
      setProgress(0)
    }
  }, [validateFile])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!internalFile || !isUploading) return

    let isMounted = true
    let currentProgress = 0

    const simulateProgress = () => {
      const interval = setInterval(() => {
        if (!isMounted) return

        currentProgress += 10
        if (currentProgress >= 100) {
          clearInterval(interval)
          setProgress(100)
          setIsUploading(false)
          onFileSelect(internalFile)
        } else {
          setProgress(currentProgress)
        }
      }, 300)

      return interval
    }

    const interval = simulateProgress()
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [internalFile, isUploading, onFileSelect])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalFile(null)
    setProgress(0)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          internalFile && !error ? "bg-muted/50" : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {internalFile && !error ? (
          <div className="flex flex-col items-center gap-2">
            <FileType className="h-10 w-10 text-primary" />
            <div className="text-sm font-medium">{internalFile.name}</div>
            <div className="text-xs text-muted-foreground">{(internalFile.size / (1024 * 1024)).toFixed(2)} MB</div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={handleRemoveFile}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">Drag and drop your APK file here</div>
            <div className="text-xs text-muted-foreground">or click to browse files</div>
            <div className="text-xs text-muted-foreground mt-2">Only .apk files up to {maxSize}MB are supported</div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  )
}

