"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Option {
  id: string
  label: string
  description?: string
}

interface OptionsSectionProps {
  options: Option[]
  onChange: (selectedOptions: string[]) => void
}

export function OptionsSection({ options, onChange }: OptionsSectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleOptionChange = (optionId: string, checked: boolean) => {
    const newSelectedOptions = checked
      ? [...selectedOptions, optionId]
      : selectedOptions.filter((id) => id !== optionId)

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor={option.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
                {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

