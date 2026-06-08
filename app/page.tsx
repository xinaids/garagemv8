'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  SERVICES, TIMES, VehicleType, VehicleSize, ServicePrice,
  SIZE_LABELS_CARRO, SIZE_LABELS_MOTO,
  formatPrice, getPriceForSize, hasSizeVariation, getDefaultPrice,
} from '@/lib/services'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function getCalDays(y: number, m: number) {
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const days: (number | null)[] = Array(first).fill(null)
  for (let i = 1; i <= total; i++) days.push(i)
  return days
}

const base: React.CSSProperties = {
  background: 'var(--surface)', border: '.5px solid var(--border2)',
  color: '#fff', fontSize: 13, padding: '10px 12px', borderRadius: 8,
  outline: 'none', fontFamily: 'inherit', width: '100%',
}

export default function BookingPage() {
  const today = new Date()
  const [vehicleType, setVehicleType] = useState<VehicleType>('carro')
  const [selectedId, setSelectedId] = useState('c-lav-simples')
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('hatch')
  const [calY, setCalY] = useState(today.getFullYear())
  const [calM, setCalM] = useState(today.getMonth())
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [takenTimes, setTakenTimes] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', whatsapp: '', vehicle: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const services = SERVICES.filter(s => s.vehicleType === vehicleType)
  const categories = [...new Set(services.map(s => s.category))]
  const selectedSvc = SERVICES.find(s => s.id === selectedId)
  const sizeLabels = vehicleType === 'carro' ? SIZE_LABELS_CARRO : SIZE_LABELS_MOTO
  const showSizePicker = selectedSvc ? hasSizeVariation(selectedSvc) : false
  const finalPrice = selectedSvc
    ? (selectedSvc.prices.unico ?? getPriceForSize(selectedSvc, vehicleSize))
    : null
  const calDays = getCalDays(calY, calM)

  useEffect(() => {
    if (!date) return
    supabase.from('bookings').select('time').eq('date', date).neq('status', 'cancelled')
      .then(({ data }) => setTakenTimes((data ?? []).map((b: any) => b.time)))
  }, [date])

  function changeVehicle(t: VehicleType) {
    setVehicleType(t)
    const first = SERVICES.find(s => s.vehicleType === t)
    if (first) setSelectedId(first.id)
    setVehicleSize(t === 'carro' ? 'hatch' : 'nao_carenada')
  }

  function selectService(id: string) {
    setSelectedId(id)
    // reset size to first available
    const svc = SERVICES.find(s => s.id === id)
    if (svc) {
      if (vehicleType === 'carro') {
        const first = SIZE_LABELS_CARRO.find(l => (svc.prices as any)[l.key] != null)
        if (first) setVehicleSize(first.key as VehicleSize)
      } else {
        const first = SIZE_LABELS_MOTO.find(l => (svc.prices as any)[l.key] != null)
        if (first) setVehicleSize(first.key as VehicleSize)
      }
    }
  }

  function selectDate(day: number) {
    const d = new Date(calY, calM, day)
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return
    if (d.getDay() === 0) return
    const str = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setDate(str)
    setTime('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.whatsapp || !form.vehicle || !date || !time) {
      setError('Preencha todos os campos e selecione data e horário.')
      return
    }
    setLoading(true); setError('')
    const sizeLabel = sizeLabels.find(l => l.key === vehicleSize)?.label ?? ''
    const serviceName = selectedSvc?.name ?? ''
    const fullService = showSizePicker ? `${serviceName} (${sizeLabel})` : serviceName

    const { error: dbError } = await supabase.from('bookings').insert({
      name: form.name, whatsapp: form.whatsapp, vehicle: form.vehicle,
      vehicle_type: vehicleType,
      service: fullService,
      price: finalPrice != null ? formatPrice(finalPrice) : null,
      date, time, status: 'pending',
    })
    setLoading(false)
    if (dbError) { setError('Erro ao salvar. Tente novamente.'); console.error(dbError) }
    else setDone(true)
  }

  const s = {
    page:    { minHeight: '100vh', background: 'var(--bg)' } as React.CSSProperties,
    header:  { background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 10 } as React.CSSProperties,
    body:    { maxWidth: 580, margin: '0 auto', padding: '28px 16px 80px' } as React.CSSProperties,
    section: { marginBottom: 28 } as React.CSSProperties,
    label:   { fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.09em', textTransform: 'uppercase' as const, marginBottom: 10, display: 'block' } as React.CSSProperties,
    card:    { background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' } as React.CSSProperties,
  }

  if (done) return (
    <div style={s.page}>
      <header style={s.header}>
        <Logo /><a href="/admin" style={{ fontSize: 11, color: 'var(--text3)', border: '.5px solid var(--border2)', padding: '5px 12px', borderRadius: 20 }}>Painel →</a>
      </header>
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ fontSize: 52 }}>✅</div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, margin: '16px 0 8px' }}>Agendamento recebido!</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>
          {selectedSvc?.name}{showSizePicker ? ` (${sizeLabels.find(l => l.key === vehicleSize)?.label})` : ''}<br />
          {date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : ''} às {time}
          {finalPrice != null ? <><br /><strong>{formatPrice(finalPrice)}</strong></> : ''}
        </p>
        <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 10 }}>Entraremos em contato pelo WhatsApp para confirmar.</p>
        <button onClick={() => { setDone(false); setForm({ name: '', whatsapp: '', vehicle: '' }); setDate(''); setTime('') }}
          style={{ marginTop: 24, background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', fontSize: 13, padding: '9px 22px', borderRadius: 20, cursor: 'pointer' }}>
          Novo agendamento
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Logo />
        <a href="/admin" style={{ fontSize: 11, color: 'var(--text3)', border: '.5px solid var(--border2)', padding: '5px 12px', borderRadius: 20 }}>Painel →</a>
      </header>

      <div style={s.body}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Agendar serviço</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 28 }}>Escolha o serviço, data e horário. Confirmamos pelo WhatsApp.</p>

        <form onSubmit={handleSubmit}>

          {/* 1. Tipo de veículo */}
          <div style={s.section}>
            <span style={s.label}>Tipo de veículo</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['carro', 'moto'] as VehicleType[]).map(v => (
                <button key={v} type="button" onClick={() => changeVehicle(v)} style={{
                  flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: vehicleType === v ? '#1c1c1c' : 'transparent',
                  border: `.5px solid ${vehicleType === v ? '#fff' : 'var(--border)'}`,
                  color: vehicleType === v ? '#fff' : 'var(--text2)',
                  transition: 'all .15s',
                }}>
                  {v === 'carro' ? '🚗' : '🏍'} {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Serviço */}
          <div style={s.section}>
            <span style={s.label}>Serviço</span>
            <div style={s.card}>
              {categories.map((cat, ci) => (
                <div key={cat}>
                  {ci > 0 && <div style={{ height: '.5px', background: 'var(--border)', margin: '0 14px' }} />}
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', padding: '11px 14px 6px' }}>{cat}</div>
                  {services.filter(sv => sv.category === cat).map(svc => {
                    const startPrice = getDefaultPrice(svc)
                    const sel = selectedId === svc.id
                    return (
                      <div key={svc.id} onClick={() => selectService(svc.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', cursor: 'pointer', margin: '2px 4px', borderRadius: 8,
                        background: sel ? '#1c1c1c' : 'transparent', transition: 'background .12s',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: sel ? '#fff' : 'var(--text2)' }}>{svc.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{svc.detail}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: startPrice ? '#fff' : 'var(--text3)', whiteSpace: 'nowrap' }}>
                            {startPrice ? `a partir de ${formatPrice(startPrice)}` : 'Consultar'}
                          </span>
                          <div style={{ width: 15, height: 15, borderRadius: '50%', flexShrink: 0, background: sel ? '#fff' : 'transparent', border: `.5px solid ${sel ? '#fff' : 'var(--border2)'}`, transition: 'all .12s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Porte do veículo (quando aplicável) */}
          {showSizePicker && selectedSvc && (
            <div style={s.section}>
              <span style={s.label}>Porte do veículo</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {sizeLabels.map(({ key, label }) => {
                  const price = (selectedSvc.prices as any)[key] as number | undefined
                  if (price == null) return null
                  const sel = vehicleSize === key
                  return (
                    <button key={key} type="button" onClick={() => setVehicleSize(key as VehicleSize)} style={{
                      flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      background: sel ? '#1c1c1c' : 'transparent',
                      border: `.5px solid ${sel ? '#fff' : 'var(--border)'}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: sel ? '#fff' : 'var(--text2)' }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: sel ? '#fff' : 'var(--text3)', marginTop: 3 }}>{formatPrice(price)}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. Calendário */}
          <div style={s.section}>
            <span style={s.label}>Data</span>
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '.5px solid var(--border)' }}>
                <button type="button" onClick={() => { if (calM === 0) { setCalM(11); setCalY(y => y - 1) } else setCalM(m => m - 1) }}
                  style={{ background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', width: 29, height: 29, borderRadius: 7, fontSize: 15, cursor: 'pointer' }}>‹</button>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{MONTHS[calM]} {calY}</span>
                <button type="button" onClick={() => { if (calM === 11) { setCalM(0); setCalY(y => y + 1) } else setCalM(m => m + 1) }}
                  style={{ background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', width: 29, height: 29, borderRadius: 7, fontSize: 15, cursor: 'pointer' }}>›</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '12px 10px 8px' }}>
                {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', fontWeight: 600, paddingBottom: 8, letterSpacing: '.04em' }}>{d}</div>)}
                {calDays.map((day, i) => {
                  if (!day) return <div key={i} />
                  const d = new Date(calY, calM, day)
                  const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const sunday = d.getDay() === 0
                  const disabled = past || sunday
                  const str = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isSel = str === date
                  const isToday = d.toDateString() === today.toDateString()
                  return (
                    <div key={i} onClick={() => !disabled && selectDate(day)} style={{
                      textAlign: 'center', padding: '7px 2px', borderRadius: 7, cursor: disabled ? 'default' : 'pointer',
                      background: isSel ? '#fff' : isToday ? '#1c1c1c' : 'transparent',
                      color: isSel ? '#0a0a0a' : disabled ? '#2e2e2e' : '#fff',
                      fontWeight: isSel || isToday ? 600 : 400, fontSize: 13,
                      transition: 'all .12s',
                    }}>
                      {day}
                    </div>
                  )
                })}
              </div>
              {date && (
                <div style={{ borderTop: '.5px solid var(--border)', padding: '14px 14px 16px' }}>
                  <span style={{ ...s.label, marginBottom: 12 }}>Horário</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
                    {TIMES.map(t => {
                      const taken = takenTimes.includes(t)
                      const sel = t === time
                      return (
                        <button key={t} type="button" disabled={taken} onClick={() => setTime(t)} style={{
                          padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: taken ? 'not-allowed' : 'pointer',
                          background: sel ? '#fff' : taken ? '#0f0f0f' : 'transparent',
                          border: `.5px solid ${sel ? '#fff' : taken ? 'var(--border)' : 'var(--border2)'}`,
                          color: sel ? '#0a0a0a' : taken ? '#2e2e2e' : '#fff',
                          textDecoration: taken ? 'line-through' : 'none',
                          transition: 'all .12s',
                        }}>
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Dados pessoais */}
          <div style={s.section}>
            <span style={s.label}>Seus dados</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ ...s.label, marginBottom: 6 }}>Nome</label>
                  <input style={base} placeholder="Seu nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ ...s.label, marginBottom: 6 }}>WhatsApp</label>
                  <input style={base} placeholder="(xx) 9xxxx-xxxx" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ ...s.label, marginBottom: 6 }}>Veículo</label>
                <input style={base} placeholder="Ex: Gol Branco — HJK 1234" value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Resumo */}
          {selectedSvc && date && time && (
            <div style={{ background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ ...s.label, marginBottom: 10 }}>Resumo</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                  {selectedSvc.name}{showSizePicker ? ` · ${sizeLabels.find(l => l.key === vehicleSize)?.label}` : ''}
                </span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{formatPrice(finalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                </span>
                <span style={{ color: '#fff', fontSize: 13 }}>{time}</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#fff', color: '#0a0a0a', border: 'none',
            fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 9, cursor: 'pointer',
            opacity: loading ? 0.6 : 1, letterSpacing: '.01em', transition: 'opacity .15s',
          }}>
            {loading ? 'Salvando...' : 'Confirmar agendamento'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🚗</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '.03em' }}>Garagem V8</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Estética Automotiva</div>
      </div>
    </div>
  )
}
