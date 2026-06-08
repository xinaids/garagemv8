export type VehicleType = 'carro' | 'moto'
export type VehicleSize = 'hatch' | 'sedan' | 'pickup' | 'nao_carenada' | 'carenada'

export interface ServicePrice {
  hatch?: number
  sedan?: number
  pickup?: number
  nao_carenada?: number
  carenada?: number
  unico?: number   // preço único, sem variação por porte
}

export interface Service {
  id: string
  name: string
  category: string
  vehicleType: VehicleType
  detail: string
  prices: ServicePrice
}

// Helpers
export function getDefaultPrice(svc: Service): number | null {
  const p = svc.prices
  return p.unico ?? p.hatch ?? p.nao_carenada ?? null
}

export function formatPrice(n: number | undefined | null): string {
  if (n == null) return 'Consultar'
  return `R$${n.toFixed(2).replace('.', ',')}`
}

export function getPriceForSize(svc: Service, size: VehicleSize): number | null {
  return (svc.prices as any)[size] ?? null
}

export function hasSizeVariation(svc: Service): boolean {
  const p = svc.prices
  if (svc.vehicleType === 'moto') return !!(p.nao_carenada && p.carenada)
  return !!(p.hatch || p.sedan || p.pickup) && !p.unico
}

// ─────────────────────────────────────────
export const SERVICES: Service[] = [
  // ── CARROS — Lavagens ──────────────────
  {
    id: 'c-lav-simples',
    name: 'Lavagem simples',
    category: 'Lavagens',
    vehicleType: 'carro',
    detail: 'Limpeza Nível I · Exterior + interior básico',
    prices: { hatch: 75, sedan: 75, pickup: 95 },
  },
  {
    id: 'c-lav-detalhada',
    name: 'Lavagem detalhada',
    category: 'Lavagens',
    vehicleType: 'carro',
    detail: 'Limpeza Nível II · Exterior completo + interior',
    prices: { hatch: 100, sedan: 130, pickup: 150 },
  },
  {
    id: 'c-lav-premium',
    name: 'Lavagem premium',
    category: 'Lavagens',
    vehicleType: 'carro',
    detail: 'Limpeza Nível III · Completo + proteção 3 meses',
    prices: { hatch: 200, sedan: 250, pickup: 300 },
  },
  {
    id: 'c-lav-ext',
    name: 'Lavagem externa detalhada',
    category: 'Lavagens',
    vehicleType: 'carro',
    detail: 'Hatch e sedã',
    prices: { hatch: 65.90, sedan: 95.90 },
  },
  {
    id: 'c-combo-prevenda',
    name: 'Combo Pré-Venda',
    category: 'Lavagens',
    vehicleType: 'carro',
    detail: 'Exterior + interior completo para revenda',
    prices: { hatch: 279.99, sedan: 279.99 },
  },

  // ── CARROS — Higienização ──────────────
  {
    id: 'c-hig-interna',
    name: 'Higienização interna',
    category: 'Higienização',
    vehicleType: 'carro',
    detail: 'Externa + interna + proteção antibacteriana',
    prices: { hatch: 500, sedan: 550, pickup: 700 },
  },
  {
    id: 'c-hig-banco',
    name: 'Higienização de banco',
    category: 'Higienização',
    vehicleType: 'carro',
    detail: 'Tecido — bancos dianteiros',
    prices: { unico: 200 },
  },
  {
    id: 'c-hig-teto',
    name: 'Higienização de teto',
    category: 'Higienização',
    vehicleType: 'carro',
    detail: 'Forro e acabamento interno',
    prices: { unico: 200 },
  },
  {
    id: 'c-hig-estofado',
    name: 'Higienização de estofado',
    category: 'Higienização',
    vehicleType: 'carro',
    detail: 'Bancos e carpetes · consultar preço',
    prices: {},
  },

  // ── CARROS — Polimento & Proteção ──────
  {
    id: 'c-pol-farol',
    name: 'Polimento de faróis',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Remoção de oxidação + vitrificação',
    prices: { unico: 279.90 },
  },
  {
    id: 'c-pol-comercial',
    name: 'Polimento comercial',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Polimento parcial · remoção de 70–90% dos riscos',
    prices: { hatch: 550, sedan: 600, pickup: 700 },
  },
  {
    id: 'c-pol-tecnico',
    name: 'Polimento técnico',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Correção de pintura · remoção de 99% dos riscos',
    prices: { hatch: 800, sedan: 900, pickup: 1000 },
  },
  {
    id: 'c-vitrif',
    name: 'Vitrificação de pintura',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Vitrificação 1 ano · proteção completa',
    prices: { hatch: 700, sedan: 800, pickup: 900 },
  },
  {
    id: 'c-chuva-acida',
    name: 'Remoção de chuva ácida',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Vidros, pintura e plásticos',
    prices: { unico: 150 },
  },
  {
    id: 'c-cofre-motor',
    name: 'Limpeza do cofre do motor',
    category: 'Polimento & Proteção',
    vehicleType: 'carro',
    detail: 'Hatch e sedã',
    prices: { hatch: 175.95, sedan: 175.95 },
  },

  // ── MOTOS ──────────────────────────────
  {
    id: 'm-lav-simples',
    name: 'Lavagem simples',
    category: 'Lavagens',
    vehicleType: 'moto',
    detail: 'Snow foam + plásticos + rodas + vidros',
    prices: { nao_carenada: 60, carenada: 80 },
  },
  {
    id: 'm-lav-det',
    name: 'Lavagem detalhada',
    category: 'Lavagens',
    vehicleType: 'moto',
    detail: 'Completa + descontaminação + lubrificação',
    prices: { nao_carenada: 200 },
  },
  {
    id: 'm-banco',
    name: 'Tratamento do banco',
    category: 'Higienização',
    vehicleType: 'moto',
    detail: 'Limpeza + hidratação do couro',
    prices: { nao_carenada: 80, carenada: 100 },
  },
  {
    id: 'm-farol',
    name: 'Revitalização de farol e painel',
    category: 'Higienização',
    vehicleType: 'moto',
    detail: 'Remoção de amarelamento + proteção',
    prices: { nao_carenada: 80, carenada: 100 },
  },
  {
    id: 'm-polimento',
    name: 'Polimento',
    category: 'Polimento & Proteção',
    vehicleType: 'moto',
    detail: 'Correção de pintura + brilho',
    prices: { nao_carenada: 200, carenada: 250 },
  },
  {
    id: 'm-chuva-acida',
    name: 'Remoção de chuva ácida',
    category: 'Polimento & Proteção',
    vehicleType: 'moto',
    detail: 'Vidros e plásticos',
    prices: { unico: 150 },
  },
]

export const TIMES = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
]

export const SIZE_LABELS_CARRO: { key: keyof ServicePrice; label: string }[] = [
  { key: 'hatch',  label: 'Hatch' },
  { key: 'sedan',  label: 'Sedan' },
  { key: 'pickup', label: 'Pick-up' },
]

export const SIZE_LABELS_MOTO: { key: keyof ServicePrice; label: string }[] = [
  { key: 'nao_carenada', label: 'Não carenada' },
  { key: 'carenada',     label: 'Carenada' },
]
