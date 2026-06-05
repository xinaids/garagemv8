export type VehicleType = 'carro' | 'moto'

export interface Service {
  id: string
  name: string
  price: string | null
  priceDisplay: string
  detail: string
  category: string
  vehicleType: VehicleType
}

export const SERVICES: Service[] = [
  // ── CARROS ──────────────────────────────────────────
  // Lavagens
  { id: 'c-lav-simples',    name: 'Lavagem simples',              price: '50.00',  priceDisplay: 'R$50,00',   detail: 'Exterior, rodas e vidros',       category: 'Lavagens',             vehicleType: 'carro' },
  { id: 'c-lav-ext',        name: 'Lavagem externa detalhada',    price: '65.90',  priceDisplay: 'R$65,90',   detail: 'Hatch e sedã',                   category: 'Lavagens',             vehicleType: 'carro' },
  { id: 'c-lav-det',        name: 'Lavagem detalhada',            price: null,     priceDisplay: 'Consultar', detail: 'Completa + interior',            category: 'Lavagens',             vehicleType: 'carro' },
  { id: 'c-lav-premium',    name: 'Lavagem premium',              price: null,     priceDisplay: 'Consultar', detail: 'Completa + acabamento',          category: 'Lavagens',             vehicleType: 'carro' },
  { id: 'c-combo-prevenda',  name: 'Combo Pré-Venda',             price: '279.99', priceDisplay: 'R$279,99',  detail: 'Hatch e sedan',                  category: 'Lavagens',             vehicleType: 'carro' },
  // Higienização
  { id: 'c-hig-interna',    name: 'Higienização interna',         price: null,     priceDisplay: 'Consultar', detail: 'Painel, portas e tapetes',       category: 'Higienização',         vehicleType: 'carro' },
  { id: 'c-hig-estofado',   name: 'Higienização de estofado',     price: null,     priceDisplay: 'Consultar', detail: 'Bancos e carpetes',              category: 'Higienização',         vehicleType: 'carro' },
  { id: 'c-hig-banco',      name: 'Higienização de banco',        price: '200.00', priceDisplay: 'R$200,00',  detail: 'Tecido — bancos dianteiros',     category: 'Higienização',         vehicleType: 'carro' },
  { id: 'c-hig-teto',       name: 'Higienização de teto',         price: '200.00', priceDisplay: 'R$200,00',  detail: 'Forro e acabamento',             category: 'Higienização',         vehicleType: 'carro' },
  // Polimento & Proteção
  { id: 'c-pol-farol',      name: 'Polimento de faróis',          price: '279.90', priceDisplay: 'R$279,90',  detail: '+ vitrificação protetora',      category: 'Polimento & Proteção', vehicleType: 'carro' },
  { id: 'c-pol-comercial',  name: 'Polimento comercial',          price: null,     priceDisplay: 'Consultar', detail: 'Remoção de riscos finos',        category: 'Polimento & Proteção', vehicleType: 'carro' },
  { id: 'c-pol-tecnico',    name: 'Polimento técnico',            price: null,     priceDisplay: 'Consultar', detail: 'Correção de pintura',            category: 'Polimento & Proteção', vehicleType: 'carro' },
  { id: 'c-vitrif',         name: 'Vitrificação de pintura',      price: null,     priceDisplay: 'Consultar', detail: 'Proteção de longa duração',      category: 'Polimento & Proteção', vehicleType: 'carro' },
  { id: 'c-chuva-acida',    name: 'Remoção de chuva ácida',       price: '150.00', priceDisplay: 'R$150,00',  detail: 'Vidros e lataria',               category: 'Polimento & Proteção', vehicleType: 'carro' },
  { id: 'c-cofre-motor',    name: 'Limpeza do cofre do motor',    price: '175.95', priceDisplay: 'R$175,95',  detail: 'Hatch e sedã',                   category: 'Polimento & Proteção', vehicleType: 'carro' },

  // ── MOTOS ───────────────────────────────────────────
  { id: 'm-lav-simples',    name: 'Lavagem simples',              price: '60.00',  priceDisplay: 'R$60,00',   detail: 'Não carenada',                   category: 'Lavagens',             vehicleType: 'moto' },
  { id: 'm-lav-det',        name: 'Lavagem detalhada',            price: '200.00', priceDisplay: 'R$200,00',  detail: 'Não carenada',                   category: 'Lavagens',             vehicleType: 'moto' },
  { id: 'm-banco',          name: 'Tratamento do banco',          price: '80.00',  priceDisplay: 'R$80,00',   detail: 'Couro — não carenada',           category: 'Higienização',         vehicleType: 'moto' },
  { id: 'm-farol',          name: 'Revitalização de farol e painel', price: '80.00', priceDisplay: 'R$80,00', detail: 'Não carenada',                   category: 'Higienização',         vehicleType: 'moto' },
  { id: 'm-polimento',      name: 'Polimento',                    price: '200.00', priceDisplay: 'R$200,00',  detail: 'Não carenada',                   category: 'Polimento & Proteção', vehicleType: 'moto' },
  { id: 'm-chuva-acida',    name: 'Remoção de chuva ácida',       price: '150.00', priceDisplay: 'R$150,00',  detail: 'Vidros e plásticos',             category: 'Polimento & Proteção', vehicleType: 'moto' },
]

export const TIMES = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
]
