import { ProductForm } from "../product-form"

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">New Product</h2>
                <p className="text-muted-foreground">Add a new item to your menu.</p>
            </div>
            <ProductForm />
        </div>
    )
}
