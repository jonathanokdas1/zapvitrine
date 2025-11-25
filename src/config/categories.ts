export const STORE_CATEGORIES = [
    {
        label: "Gastronomia",
        type: "FOOD",
        items: [
            { label: "Lanches & Burger", value: "lanches", icon: "🍔" },
            { label: "Pizzaria", value: "pizzaria", icon: "🍕" },
            { label: "Açaí & Doces", value: "acai", icon: "🍧" },
            { label: "Marmitas & Restaurantes", value: "marmitas", icon: "🍱" }
        ]
    },
    {
        label: "Varejo",
        type: "RETAIL",
        items: [
            { label: "Moda & Roupas", value: "moda", icon: "👗" },
            { label: "Presentes & Acessórios", value: "presentes", icon: "🎁" },
            { label: "Eletrônicos & Celulares", value: "eletronicos", icon: "📱" },
            { label: "Pet Shop", value: "petshop", icon: "🐶" }
        ]
    },
    {
        label: "Serviços",
        type: "SERVICE",
        items: [
            { label: "Beleza & Estética", value: "beleza", icon: "💇‍♀️" },
            { label: "Barbearia", value: "barbearia", icon: "💈" },
            { label: "Serviços Gerais", value: "servicos", icon: "🛠️" },
            { label: "Saúde", value: "saude", icon: "🩺" }
        ]
    }
] as const;

export type StoreType = "FOOD" | "RETAIL" | "SERVICE";

export function getCategoryInfo(slug: string) {
    for (const group of STORE_CATEGORIES) {
        const item = group.items.find(i => i.value === slug);
        if (item) {
            return { ...item, type: group.type as StoreType };
        }
    }
    return null;
}
