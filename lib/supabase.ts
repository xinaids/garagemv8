import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  created_at: string
  name: string
  whatsapp: string
  vehicle: string
  vehicle_type: 'carro' | 'moto'
  service: string
  price: string | null
  date: string
  time: string
  status: BookingStatus
}
