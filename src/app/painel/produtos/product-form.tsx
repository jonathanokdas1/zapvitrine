"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Upload } from "lucide-react"
import { createProduct, updateProduct } from "@/app/actions"
import { toast } from "sonner"

interface VariantOption {
    label: string
    price: number
}

interface Variant {
    name: string
    type: "SELECT" | "CHECKBOX"
    options: VariantOption[]
    min_selection?: number
    max_selection?: number
}

export function ProductForm({ plan, product }: { plan: string, product?: any }) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [images, setImages] = React.useState<string[]>(product ? JSON.parse(product.images) : [])
    const [variants, setVariants] = React.useState<Variant[]>(product ? JSON.parse(product.variants) : [])
    const [isService, setIsService] = React.useState(product?.is_service || false)

    const isFreePlan = plan === "FREE"
    const maxImages = isFreePlan ? 1 : 5
    const canUpload = images.length < maxImages

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!canUpload) return

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            toast.error("Formato inválido. Use JPG, PNG ou WebP.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 5MB.")
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)

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
                toast.error("Falha ao salvar produto")
                setLoading(false)
            }
        }
    }

    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        // Optional: Add visual cue for drop target
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedIndex === null) return

        const newImages = [...images]
        const [draggedImage] = newImages.splice(draggedIndex, 1)
        newImages.splice(dropIndex, 0, draggedImage)
        setImages(newImages)
        setDraggedIndex(null)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>{product ? "Editar Produto" : "Informações Básicas"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nome do Produto <span className="text-red-500">*</span></Label>
                        <Input id="title" name="title" required placeholder="Ex: X-Bacon" defaultValue={product?.title} />
                        <p className="text-[0.8rem] text-muted-foreground">Nome principal que aparecerá no seu cardápio.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" name="description" placeholder="Descreva seu produto..." defaultValue={product?.description} />
                        <p className="text-[0.8rem] text-muted-foreground">Detalhes, ingredientes ou informações importantes para o cliente.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_service"
                                name="is_service"
                                defaultChecked={product?.is_service}
                                onCheckedChange={(checked) => {
                                    setIsService(checked)
                                }}
                            />
                            <Label htmlFor="is_service">Este item é um serviço? (Agendamento)</Label>
                            <input type="hidden" name="is_service" value={isService ? "true" : "false"} />
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">Marque se for um serviço (ex: corte de cabelo) em vez de um produto físico.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$) <span className="text-red-500">*</span></Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                defaultValue={product ? Number(product.price) / 100 : ""}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Valor de venda do produto.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promo_price">Preço Promocional</Label>
                            <Input
                                id="promo_price"
                                name="promo_price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                defaultValue={product?.promo_price ? Number(product.promo_price) / 100 : ""}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Preço com desconto (opcional).</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Imagens</CardTitle>
                    <p className="text-sm text-muted-foreground">Adicione fotos para ilustrar seu produto. A primeira imagem será a principal.</p>
                    <p className="text-xs text-muted-foreground mt-1">Resolução Recomendada: 800 x 600 pixels (4:3). Máximo 5MB por foto.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!canUpload && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
                            {isFreePlan
                                ? "Limite do plano Grátis atingido (1 imagem). Faça upgrade para PRO para mais."
                                : "Limite de imagens atingido (5 imagens)."
                            }
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                        {images.map((url, i) => (
                            <div
                                key={i}
                                className={`relative w-32 h-24 border rounded-lg overflow-hidden group cursor-move ${draggedIndex === i ? 'opacity-50' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(i)}
                                onDragOver={(e) => handleDragOver(e, i)}
                                onDrop={(e) => handleDrop(e, i)}
                            >
                                <img src={url} alt="Produto" className="w-full h-full object-cover pointer-events-none" />
                                {i === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 z-10">
                                        Principal
                                    </div>
                                )}
                                {i !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...images]
                                            const [selected] = newImages.splice(i, 1)
                                            newImages.unshift(selected)
                                            setImages(newImages)
                                        }}
                                        className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-blue-700"
                                    >
                                        Definir Principal
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        {canUpload && (
                            <label className="w-32 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-center p-2">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1 font-medium">Upload</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP</span>
                                <span className="text-[9px] text-gray-400">Max 5MB</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleImageUpload}
                                    disabled={loading}
                                />
                            </label>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Variações / Adicionais</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Opções extras como tamanho, sabor ou complementos.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Grupo
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {variants.map((variant, vIndex) => (
                        <div key={vIndex} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Nome do Grupo</Label>
                                    <Input
                                        value={variant.name}
                                        onChange={(e) => updateVariant(vIndex, "name", e.target.value)}
                                        placeholder="Ex: Tamanho, Sabores"
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Tipo</Label>
                                    <Select
                                        value={variant.type}
                                        onValueChange={(val) => updateVariant(vIndex, "type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SELECT">Única Opção</SelectItem>
                                            <SelectItem value="CHECKBOX">Múltipla Escolha</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => removeVariant(vIndex)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            {/* Min/Max Selection Section */}
                            <div className="bg-white p-3 rounded border border-dashed border-gray-300 space-y-3">
                                <Label className="text-xs font-semibold text-gray-500 uppercase">Limites de Seleção</Label>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-gray-400">
                                            {variant.type === "SELECT" ? "Obrigatório?" : "Mínimo (Obrigatório se > 0)"}
                                        </Label>
                                        {variant.type === "SELECT" ? (
                                            <div className="flex items-center h-8">
                                                <Switch
                                                    checked={variant.min_selection === 1}
                                                    onCheckedChange={(checked) => updateVariant(vIndex, "min_selection", checked ? 1 : 0)}
                                                />
                                                <span className="ml-2 text-sm">{variant.min_selection === 1 ? "Sim" : "Não"}</span>
                                            </div>
                                        ) : (
                                            <Input
                                                type="number"
                                                min="0"
                                                className="h-8 text-sm"
                                                value={variant.min_selection || 0}
                                                onChange={(e) => updateVariant(vIndex, "min_selection", parseInt(e.target.value) || 0)}
                                            />
                                        )}
                                    </div>
                                    {variant.type === "CHECKBOX" && (
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-gray-400">Máximo</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                className="h-8 text-sm"
                                                value={variant.max_selection || 1}
                                                onChange={(e) => updateVariant(vIndex, "max_selection", parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                <Label className="text-xs uppercase text-gray-500">Opções</Label>
                                {variant.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <Input
                                            placeholder="Nome (Ex: Grande)"
                                            value={option.label}
                                            onChange={(e) => updateOption(vIndex, oIndex, "label", e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Preço (+R$)"
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
                                    + Adicionar Opção
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Produto"}
                </Button>
            </div>
        </form>
    )
}
