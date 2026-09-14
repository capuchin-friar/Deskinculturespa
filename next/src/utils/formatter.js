

class Formatter{

    static formatRevenue(n, currency) {
        if (n == null || n === "") return "—"
        const num = Number(n)
        if (Number.isNaN(num)) return "—"
        const cur = typeof currency === "string" && currency.trim() ? currency.trim() : " "
        try {
            return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(num)
        } catch {
            return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
    }
}

export default Formatter