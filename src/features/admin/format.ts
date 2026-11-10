export const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatQuantity = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
