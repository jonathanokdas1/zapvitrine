"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import { useCart } from "./cart-context"
import { formatCurrency } from "@/lib/utils"
import { createWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp"

export function CheckoutDrawer() {
    const { items, removeFromCart, clearCart, total } = useCart()
    const [isOpen, setIsOpen] = React.useState(false)
    const [step, setStep] = React.useState(1)
    const [loadingCep, setLoadingCep] = React.useState(false)

    const [customerName, setCustomerName] = React.useState("")
    const [cep, setCep] = React.useState("")
    const [addressNumber, setAddressNumber] = React.useState("")
    const [addressComplement, setAddressComplement] = React.useState("")

    // Address fields from API
    const [street, setStreet] = React.useState("")
    const [neighborhood, setNeighborhood] = React.useState("")
    const [city, setCity] = React.useState("")

    React.useEffect(() => {
        const savedName = localStorage.getItem("customerName")
        const savedCep = localStorage.getItem("customerCep")
        const savedNumber = localStorage.getItem("customerNumber")
        const savedComplement = localStorage.getItem("customerComplement")
        const savedStreet = localStorage.getItem("customerStreet")
        const savedNeighborhood = localStorage.getItem("customerNeighborhood")
        const savedCity = localStorage.getItem("customerCity")

        if (savedName) setCustomerName(savedName)
        if (savedCep) setCep(savedCep)
        if (savedNumber) setAddressNumber(savedNumber)
        if (savedComplement) setAddressComplement(savedComplement)
        if (savedStreet) setStreet(savedStreet)
        if (savedNeighborhood) setNeighborhood(savedNeighborhood)
        if (savedCity) setCity(savedCity)
    }, [])

    const handleCepBlur = async () => {
        const cleanCep = cep.replace(/\D/g, "")
        if (cleanCep.length === 8) {
            setLoadingCep(true)
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                const data = await res.json()
                if (!data.erro) {
                    setStreet(data.logradouro)
                    setNeighborhood(data.bairro)
                    setCity(data.localidade)

                    // Save to local storage
                    localStorage.setItem("customerStreet", data.logradouro)
                    localStorage.setItem("customerNeighborhood", data.bairro)
                    localStorage.setItem("customerCity", data.localidade)
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error)
            } finally {
                setLoadingCep(false)
            }
        }
    }

    const handleCheckout = () => {
        if (!customerName || !street || !addressNumber) {
            alert("Por favor preencha os campos obrigatórios")
            return
        }

        // Save details
        localStorage.setItem("customerName", customerName)
        localStorage.setItem("customerCep", cep)
        localStorage.setItem("customerNumber", addressNumber)
        localStorage.setItem("customerComplement", addressComplement)

        const fullAddress = `${street}, ${addressNumber} ${addressComplement ? `- ${addressComplement}` : ""} - ${neighborhood}, ${city} - CEP: ${cep}`

        const orderDetails = {
            storeName: items[0]?.storeName || "Loja",
            items,
            total,
            customerName,
            address: fullAddress,
            storePhone: items[0]?.storePhone || ""
        }

        const message = createWhatsAppMessage(orderDetails)
        const link = getWhatsAppLink(items[0]?.storePhone || "", message)

        window.open(link, "_blank")
        clearCart()
        setIsOpen(false)
        setStep(1)
    }

    const formatCep = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .substr(0, 9)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
                    <ShoppingBag className="h-6 w-6" />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {items.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>
                        {step === 1 ? (items[0]?.storeType === "SERVICE" ? "Seus Agendamentos" : "Sua Sacola") : "Finalizar Pedido"}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {items.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-10">
                            {items[0]?.storeType === "SERVICE" ? "Nenhum serviço selecionado." : "Sua sacola está vazia."}
                        </div>
                    ) : (
                        <>
                            {step === 1 ? (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start border-b pb-4">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.quantity}x {item.title}</h4>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.variants.map((v, i) => (
                                                        <div key={i}>{v}</div>
                                                    ))}
                                                </div>
                                                <div className="font-bold mt-1">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Seu Nome *</Label>
                                        <Input
                                            id="name"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Como devemos te chamar?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cep">CEP *</Label>
                                        <Input
                                            id="cep"
                                            value={cep}
                                            onChange={(e) => setCep(formatCep(e.target.value))}
                                            onBlur={handleCepBlur}
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                        {loadingCep && <span className="text-xs text-blue-500">Buscando endereço...</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="street">Rua</Label>
                                        <Input
                                            id="street"
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            readOnly={!!street}
                                            className={street ? "bg-gray-50" : ""}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="number">Número *</Label>
                                            <Input
                                                id="number"
                                                value={addressNumber}
                                                onChange={(e) => setAddressNumber(e.target.value)}
                                                placeholder="123"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="comp">Complemento</Label>
                                            <Input
                                                id="comp"
                                                value={addressComplement}
                                                onChange={(e) => setAddressComplement(e.target.value)}
                                                placeholder="Apto 101"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input
                                                id="neighborhood"
                                                value={neighborhood}
                                                readOnly={!!neighborhood}
                                                className={neighborhood ? "bg-gray-50" : ""}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input
                                                id="city"
                                                value={city}
                                                readOnly={!!city}
                                                className={city ? "bg-gray-50" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t pt-4 flex-col sm:flex-col gap-3">
                        <div className="flex justify-between items-center w-full text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>

                        {step === 1 ? (
                            <Button className="w-full h-12 text-lg" onClick={() => setStep(2)}>
                                Continuar <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" className="h-12" onClick={() => setStep(1)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Button className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700" onClick={handleCheckout}>
                                    {items[0]?.storeType === "SERVICE" ? "Solicitar Agendamento" : "Enviar Pedido no Zap"}
                                </Button>
                            </div>
                        )}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
