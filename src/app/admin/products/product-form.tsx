"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload } from "lucide-react"
import { createProduct, updateProduct } from "@/app/actions"

interface VariantOption {
    label: string
    price: number
}

interface Variant {
    name: string
    type: "SELECT" | "CHECKBOX"
    options: VariantOption[]
}

export function ProductForm({ plan, product }: { plan: string, product?: any }) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [images, setImages] = React.useState<string[]>(product ? JSON.parse(product.images) : [])
    const [variants, setVariants] = React.useState<Variant[]>(product ? JSON.parse(product.variants) : [])

    const isFreePlan = plan === "FREE"
    const canUpload = !isFreePlan || images.length < 1

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        if (!canUpload) return

        setLoading(true)
        const formData = new FormData()
        formData.append("file", e.target.files[0])

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setImages([...images, data.url])
            }
        } catch (error) {
            console.error(error)
            alert("Upload failed")
        } finally {
            setLoading(false)
        }
    }

    const addVariant = () => {
        setVariants([...variants, { name: "", type: "SELECT", options: [] }])
    }

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    const addOption = (variantIndex: number) => {
        const newVariants = [...variants]
        newVariants[variantIndex].options.push({ label: "", price: 0 })
        setVariants(newVariants)
    }

    const updateOption = (variantIndex: number, optionIndex: number, field: keyof VariantOption, value: any) => {
        const newVariants = [...variants]
        newVariants[variantIndex].options[optionIndex] = {
            ...newVariants[variantIndex].options[optionIndex],
            [field]: value
        }
        setVariants(newVariants)
    }

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const newVariants = [...variants]
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex)
        setVariants(newVariants)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append("images", JSON.stringify(images))
        formData.append("variants", JSON.stringify(variants))

        if (product) {
            formData.append("id", product.id)
        }

        try {
            if (product) {
                await updateProduct(formData)
            } else {
                await createProduct(formData)
            }
        } catch (error) {
            console.error(error)
            if (!(error as Error).message.includes("NEXT_REDIRECT")) {
                alert("Failed to save product")
                setLoading(false)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>{product ? "Edit Product" : "Basic Information"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Product Title</Label>
                        <Input id="title" name="title" required placeholder="e.g. X-Bacon" defaultValue={product?.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe your product..." defaultValue={product?.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (R$)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                defaultValue={product ? Number(product.price) / 100 : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promo_price">Promo Price (Optional)</Label>
                            <Input
                                id="promo_price"
                                name="promo_price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={product?.promo_price ? Number(product.promo_price) / 100 : ""}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!canUpload && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
                            Free Plan limit reached (1 image). Upgrade to PRO for more.
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                        {images.map((url, i) => (
                            <div key={i} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                <img src={url} alt="Product" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        {canUpload && (
                            <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1">Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
                            </label>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Variants / Add-ons</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                        <Plus className="w-4 h-4 mr-2" /> Add Group
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {variants.map((variant, vIndex) => (
                        <div key={vIndex} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Group Name</Label>
                                    <Input
                                        value={variant.name}
                                        onChange={(e) => updateVariant(vIndex, "name", e.target.value)}
                                        placeholder="e.g. Size, Flavors"
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={variant.type}
                                        onValueChange={(val) => updateVariant(vIndex, "type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SELECT">Select One</SelectItem>
                                            <SelectItem value="CHECKBOX">Multiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => removeVariant(vIndex)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                <Label className="text-xs uppercase text-gray-500">Options</Label>
                                {variant.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <Input
                                            placeholder="Label (e.g. Large)"
                                            value={option.label}
                                            onChange={(e) => updateOption(vIndex, oIndex, "label", e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price (+R$)"
                                            className="w-24"
                                            value={option.price > 0 ? option.price / 100 : ""}
                                            onChange={(e) => updateOption(vIndex, oIndex, "price", parseFloat(e.target.value || "0") * 100)}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(vIndex, oIndex)}>
                                            <Trash2 className="w-3 h-3 text-gray-400" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" className="px-0 h-auto" onClick={() => addOption(vIndex)}>
                                    + Add Option
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Product"}
                </Button>
            </div>
        </form>
    )
}
