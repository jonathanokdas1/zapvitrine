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
}

interface VariantSelectorProps {
    variants: Variant[]
    selectedOptions: Record<string, string | string[]>
    onOptionChange: (variantName: string, optionLabel: string, isMulti: boolean, isChecked?: boolean) => void
}

export function VariantSelector({ variants, selectedOptions, onOptionChange }: VariantSelectorProps) {
    return (
        <div className="space-y-6">
            {variants.map((variant, vIndex) => (
                <div key={`${variant.name}-${vIndex}`} className="space-y-3">
                    <Label className="text-base font-semibold">{variant.name}</Label>

                    {variant.type === "SELECT" ? (
                        <RadioGroup
                            onValueChange={(value) => onOptionChange(variant.name, value, false)}
                            value={selectedOptions[variant.name] as string}
                        >
                            {variant.options
                                .filter(option => option.label && option.label.trim() !== "")
                                .map((option, oIndex) => (
                                    <div key={`${variant.name}-${option.label}-${oIndex}`} className="flex items-center justify-between space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center space-x-2">
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
                                    return (
                                        <div key={`${variant.name}-${option.label}-${oIndex}`} className="flex items-center justify-between space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${variant.name}-${option.label}-${oIndex}`}
                                                    checked={isChecked}
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
            ))}
        </div>
    )
}
