'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SERVICES, TIMES, VehicleType } from '@/lib/services'

export default function BookingPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('carro')
  const [selectedServiceId, setSelectedServiceId] = useState('c-lav-simples')
  const [form, setForm] = useState({ name: '', whatsapp: '', vehicle: '', date: '', time: '08:00' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const services = SERVICES.filter(s => s.vehicleType === vehicleType)
  const categories = [...new Set(services.map(s => s.category))]
  const selectedService = SERVICES.find(s => s.id === selectedServiceId)

  function handleVehicleChange(type: VehicleType) {
    setVehicleType(type)
    const first = SERVICES.find(s => s.vehicleType === type)
    if (first) setSelectedServiceId(first.id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.whatsapp || !form.vehicle || !form.date) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')

    const { error: dbError } = await supabase.from('bookings').insert({
      name: form.name,
      whatsapp: form.whatsapp,
      vehicle: form.vehicle,
      vehicle_type: vehicleType,
      service: selectedService?.name ?? '',
      price: selectedService?.priceDisplay ?? null,
      date: form.date,
      time: form.time,
      status: 'pending',
    })

    setLoading(false)
    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      console.error(dbError)
    } else {
      setDone(true)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '0' }}>
      {/* Header */}
      <header style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚗</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', letterSpacing: '.04em' }}>Garagem V8</div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: '.1em', textTransform: 'uppercase' }}>Estética Automotiva</div>
          </div>
        </div>
        <a href="/admin" style={{ fontSize: 12, color: '#444', textDecoration: 'none', border: '.5px solid #2a2a2a', padding: '5px 12px', borderRadius: 20 }}>Painel</a>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: '16px 0 8px' }}>Agendamento recebido!</h2>
            <p style={{ color: '#555', fontSize: 14 }}>Entraremos em contato pelo WhatsApp para confirmar o horário.</p>
            <button onClick={() => { setDone(false); setForm({ name: '', whatsapp: '', vehicle: '', date: '', time: '08:00' }) }}
              style={{ marginTop: 24, background: 'transparent', border: '.5px solid #333', color: '#aaa', fontSize: 13, padding: '8px 20px', borderRadius: 20, cursor: 'pointer' }}>
              Novo agendamento
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Agendar serviço</h1>
            <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>Escolha o serviço, data e horário.</p>

            {/* Vehicle tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['carro', 'moto'] as VehicleType[]).map(v => (
                <button key={v} type="button" onClick={() => handleVehicleChange(v)}
                  style={{ flex: 1, background: vehicleType === v ? '#1a1a1a' : 'transparent', border: `.5px solid ${vehicleType === v ? '#fff' : '#2a2a2a'}`, color: vehicleType === v ? '#fff' : '#555', fontSize: 13, fontWeight: 500, padding: '10px', borderRadius: 8, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {v === 'carro' ? '🚗' : '🏍'} {v}
                </button>
              ))}
            </div>

            {/* Services */}
            <div style={{ marginBottom: 22 }}>
              {categories.map(cat => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: '#444', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>{cat}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {services.filter(s => s.category === cat).map(svc => (
                      <div key={svc.id} onClick={() => setSelectedServiceId(svc.id)}
                        style={{ border: `.5px solid ${selectedServiceId === svc.id ? '#fff' : '#1e1e1e'}`, background: selectedServiceId === svc.id ? '#111' : 'transparent', borderRadius: 8, padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: selectedServiceId === svc.id ? '#fff' : '#aaa' }}>{svc.name}</div>
                          <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{svc.detail}</div>
                        </div>
                        <div style={{ fontSize: svc.price ? 14 : 11, fontWeight: svc.price ? 500 : 400, color: svc.price ? '#fff' : '#444', minWidth: 72, textAlign: 'right' }}>{svc.priceDisplay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Form fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <Field label="Nome"><input type="text" placeholder="Seu nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
              <Field label="WhatsApp"><input type="text" placeholder="(xx) 9xxxx-xxxx" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <Field label="Data"><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></Field>
              <Field label="Horário">
                <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Veículo">
              <input type="text" placeholder="Ex: Gol Branco — HJK 1234" value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} style={{ width: '100%' }} />
            </Field>

            {error && <p style={{ color: '#e05050', fontSize: 12, marginTop: 8 }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#fff', color: '#0a0a0a', border: 'none', fontSize: 14, fontWeight: 500, padding: 13, borderRadius: 8, cursor: 'pointer', marginTop: 16, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : 'Confirmar agendamento'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: '#555', letterSpacing: '.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{label}</label>
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  )
}
