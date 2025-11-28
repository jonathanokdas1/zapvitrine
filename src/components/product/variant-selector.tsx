"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"

export interface VariantOption {
    label: string
    price: number
}

export interface Variant {
    name: string
    type: "SELECT" | "CHECKBOX"
    options: VariantOption[]
    min_selection?: number
    max_selection?: number
}

interface VariantSelectorProps {
    variants: Variant[]
    selectedOptions: Record<string, string | string[]>
    onOptionChange: (variantName: string, optionLabel: string, isMulti: boolean, isChecked?: boolean) => void
    onValidationChange?: (isValid: boolean) => void
}

export function VariantSelector({ variants, selectedOptions, onOptionChange, onValidationChange }: VariantSelectorProps) {
    // Validate selections
    React.useEffect(() => {
        if (!onValidationChange) return

        const isValid = variants.every(variant => {
            const selected = selectedOptions[variant.name]
            const min = variant.min_selection || 0

            if (min === 0) return true // Optional

            if (!selected) return false
            if (Array.isArray(selected)) {
                return selected.length >= min
            }
            return true // Single selection present
        })

        onValidationChange(isValid)
    }, [variants, selectedOptions, onValidationChange])

    return (
        <div className="space-y-6">
            {variants.map((variant, vIndex) => {
                const selected = selectedOptions[variant.name]
                const currentCount = Array.isArray(selected) ? selected.length : (selected ? 1 : 0)
                const max = variant.max_selection || 1
                const min = variant.min_selection || 0
                const isMaxReached = variant.type === "CHECKBOX" && currentCount >= max

                return (
                    <div key={`${variant.name}-${vIndex}`} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Label className="text-base font-semibold">{variant.name}</Label>
                            {max > 1 && (
                                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                                    Escolha até {max}
                                </span>
                            )}
                            {min > 0 && (
                                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                    Mínimo {min}
                                </span>
                            )}
                        </div>

                        {variant.type === "SELECT" ? (
                            <RadioGroup
                                onValueChange={(value) => onOptionChange(variant.name, value, false)}
                                value={selectedOptions[variant.name] as string}
                            >
                                {variant.options
                                    .filter(option => option.label && option.label.trim() !== "")
                                    .map((option, oIndex) => (
                                        <div
                                            key={`${variant.name}-${option.label}-${oIndex}`}
                                            className="flex items-center justify-between space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => onOptionChange(variant.name, option.label, false)}
                                        >
                                            <div className="flex items-center space-x-2 pointer-events-none">
                                                <RadioGroupItem value={option.label} id={`${variant.name}-${option.label}-${oIndex}`} />
                                                <Label htmlFor={`${variant.name}-${option.label}-${oIndex}`} className="cursor-pointer">
                                                    {option.label}
                                                </Label>
                                            </div>
                                            {option.price > 0 && (
                                                <span className="text-sm text-muted-foreground">
                                                    + {formatCurrency(option.price)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </RadioGroup>
                        ) : (
                            <div className="space-y-2">
                                {variant.options
                                    .filter(option => option.label && option.label.trim() !== "")
                                    .map((option, oIndex) => {
                                        const isChecked = (selectedOptions[variant.name] as string[] || []).includes(option.label)
                                        const isDisabled = !isChecked && isMaxReached

                                        return (
                                            <div
                                                key={`${variant.name}-${option.label}-${oIndex}`}
                                                className={`flex items-center justify-between space-x-2 border p-3 rounded-lg transition-colors ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-gray-50"
                                                    }`}
                                                onClick={() => !isDisabled && onOptionChange(variant.name, option.label, true, !isChecked)}
                                            >
                                                <div className="flex items-center space-x-2 pointer-events-none">
                                                    <Checkbox
                                                        id={`${variant.name}-${option.label}-${oIndex}`}
                                                        checked={isChecked}
                                                        disabled={isDisabled}
                                                        onCheckedChange={(checked) => onOptionChange(variant.name, option.label, true, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`${variant.name}-${option.label}-${oIndex}`} className="cursor-pointer">
                                                        {option.label}
                                                    </Label>
                                                </div>
                                                {option.price > 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        + {formatCurrency(option.price)}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
