'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SERVICES, TIMES, VehicleType } from '@/lib/services'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(first).fill(null)
  for (let i = 1; i <= total; i++) days.push(i)
  return days
}

export default function BookingPage() {
  const today = new Date()
  const [vehicleType, setVehicleType] = useState<VehicleType>('carro')
  const [selectedServiceId, setSelectedServiceId] = useState('c-lav-simples')
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [form, setForm] = useState({ name: '', whatsapp: '', vehicle: '' })
  const [takenTimes, setTakenTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const services = SERVICES.filter(s => s.vehicleType === vehicleType)
  const categories = [...new Set(services.map(s => s.category))]
  const selectedService = SERVICES.find(s => s.id === selectedServiceId)
  const calDays = getCalendarDays(calYear, calMonth)

  useEffect(() => {
    if (!selectedDate) return
    supabase.from('bookings').select('time').eq('date', selectedDate).neq('status', 'cancelled')
      .then(({ data }) => setTakenTimes((data ?? []).map((b: any) => b.time)))
  }, [selectedDate])

  function selectDate(day: number) {
    const d = new Date(calYear, calMonth, day)
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return
    if (d.getDay() === 0) return // domingo fechado
    const str = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(str)
    setSelectedTime('')
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  function handleVehicleChange(type: VehicleType) {
    setVehicleType(type)
    const first = SERVICES.find(s => s.vehicleType === type)
    if (first) setSelectedServiceId(first.id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.whatsapp || !form.vehicle || !selectedDate || !selectedTime) {
      setError('Preencha todos os campos e selecione data e horário.')
      return
    }
    setLoading(true)
    setError('')
    const { error: dbError } = await supabase.from('bookings').insert({
      name: form.name, whatsapp: form.whatsapp, vehicle: form.vehicle,
      vehicle_type: vehicleType, service: selectedService?.name ?? '',
      price: selectedService?.priceDisplay ?? null,
      date: selectedDate, time: selectedTime, status: 'pending',
    })
    setLoading(false)
    if (dbError) { setError('Erro ao salvar. Tente novamente.'); console.error(dbError) }
    else setDone(true)
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg)' },
    header: { background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    logoIcon: { width: 34, height: 34, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
    logoName: { fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '.03em' },
    logoSub: { fontSize: 10, color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase' },
    adminLink: { fontSize: 11, color: 'var(--text3)', border: '.5px solid var(--border2)', padding: '5px 12px', borderRadius: 20, transition: 'all .15s' },
    body: { maxWidth: 600, margin: '0 auto', padding: '28px 16px 60px' },
    h1: { fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 },
    sub: { fontSize: 13, color: 'var(--text2)', marginBottom: 28 },
    section: { marginBottom: 28 },
    sectionLabel: { fontSize: 11, fontWeight: 500, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 },
    vtabs: { display: 'flex', gap: 8, marginBottom: 0 },
    vtab: { flex: 1, padding: '10px 0', borderRadius: 9, border: '.5px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', textAlign: 'center' as const },
    card: { background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10 },
    catLabel: { fontSize: 10, fontWeight: 500, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', padding: '12px 14px 6px' },
    svcRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', cursor: 'pointer', transition: 'background .12s', borderRadius: 8, margin: '2px 4px' },
    svcName: { fontSize: 13, fontWeight: 500 },
    svcDet: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
    svcPrice: { fontSize: 13, fontWeight: 600, color: '#fff', marginLeft: 12, flexShrink: 0 },
    dot: { width: 16, height: 16, borderRadius: '50%', border: '.5px solid var(--border2)', flexShrink: 0, marginLeft: 8, transition: 'all .15s' },
    cal: { background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
    calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '.5px solid var(--border)' },
    calTitle: { fontSize: 14, fontWeight: 600, color: '#fff' },
    calBtn: { background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', width: 28, height: 28, borderRadius: 7, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '12px 12px 16px' },
    calDayLabel: { textAlign: 'center' as const, fontSize: 10, color: 'var(--text3)', fontWeight: 500, padding: '0 0 10px', letterSpacing: '.04em' },
    timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
    timeBtn: { padding: '10px 0', borderRadius: 8, border: '.5px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'center' as const, transition: 'all .15s' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    fieldLabel: { fontSize: 10, fontWeight: 500, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', display: 'block', marginBottom: 6 },
    input: { width: '100%', background: 'var(--surface)', border: '.5px solid var(--border2)', color: '#fff', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none' },
    submitBtn: { width: '100%', background: '#fff', color: '#0a0a0a', border: 'none', fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 9, cursor: 'pointer', marginTop: 16, letterSpacing: '.01em', transition: 'opacity .15s' },
    divider: { height: '.5px', background: 'var(--border)', margin: '0 14px' },
  }

  if (done) return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🚗</div>
          <div><div style={s.logoName}>Garagem V8</div><div style={s.logoSub}>Estética Automotiva</div></div>
        </div>
      </header>
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Agendamento recebido!</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
          {selectedService?.name}<br />
          {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : ''} às {selectedTime}
        </p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 12 }}>Entraremos em contato pelo WhatsApp para confirmar.</p>
        <button onClick={() => { setDone(false); setForm({ name: '', whatsapp: '', vehicle: '' }); setSelectedDate(''); setSelectedTime('') }}
          style={{ marginTop: 28, background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', fontSize: 13, padding: '9px 22px', borderRadius: 20, cursor: 'pointer' }}>
          Novo agendamento
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🚗</div>
          <div><div style={s.logoName}>Garagem V8</div><div style={s.logoSub}>Estética Automotiva</div></div>
        </div>
        <a href="/admin" style={s.adminLink}>Painel →</a>
      </header>

      <div style={s.body}>
        <h1 style={s.h1}>Agende seu serviço</h1>
        <p style={s.sub}>Escolha o serviço, data e horário. Confirmamos pelo WhatsApp.</p>

        <form onSubmit={handleSubmit}>
          {/* Vehicle type */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Tipo de veículo</div>
            <div style={s.vtabs}>
              {(['carro', 'moto'] as VehicleType[]).map(v => (
                <button key={v} type="button" onClick={() => handleVehicleChange(v)} style={{
                  ...s.vtab,
                  background: vehicleType === v ? '#1c1c1c' : 'transparent',
                  borderColor: vehicleType === v ? '#fff' : 'var(--border)',
                  color: vehicleType === v ? '#fff' : 'var(--text2)',
                }}>
                  {v === 'carro' ? '🚗' : '🏍'} {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Serviço</div>
            <div style={s.card}>
              {categories.map((cat, ci) => (
                <div key={cat}>
                  {ci > 0 && <div style={s.divider} />}
                  <div style={s.catLabel}>{cat}</div>
                  {services.filter(sv => sv.category === cat).map(svc => (
                    <div key={svc.id} onClick={() => setSelectedServiceId(svc.id)} style={{
                      ...s.svcRow,
                      background: selectedServiceId === svc.id ? '#1c1c1c' : 'transparent',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...s.svcName, color: selectedServiceId === svc.id ? '#fff' : 'var(--text2)' }}>{svc.name}</div>
                        <div style={s.svcDet}>{svc.detail}</div>
                      </div>
                      <div style={{ ...s.svcPrice, color: svc.price ? '#fff' : 'var(--text3)' }}>{svc.priceDisplay}</div>
                      <div style={{ ...s.dot, background: selectedServiceId === svc.id ? '#fff' : 'transparent', borderColor: selectedServiceId === svc.id ? '#fff' : 'var(--border2)' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Data</div>
            <div style={s.cal}>
              <div style={s.calHeader}>
                <button type="button" onClick={prevMonth} style={s.calBtn}>‹</button>
                <span style={s.calTitle}>{MONTHS[calMonth]} {calYear}</span>
                <button type="button" onClick={nextMonth} style={s.calBtn}>›</button>
              </div>
              <div style={s.calGrid}>
                {DAYS.map(d => <div key={d} style={s.calDayLabel}>{d}</div>)}
                {calDays.map((day, i) => {
                  if (!day) return <div key={i} />
                  const d = new Date(calYear, calMonth, day)
                  const past = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const sunday = d.getDay() === 0
                  const disabled = past || sunday
                  const str = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isSelected = str === selectedDate
                  const isToday = d.toDateString() === today.toDateString()
                  return (
                    <div key={i} onClick={() => !disabled && selectDate(day)} style={{
                      textAlign: 'center', padding: '7px 0', fontSize: 13, borderRadius: 7, cursor: disabled ? 'default' : 'pointer',
                      background: isSelected ? '#fff' : isToday ? 'var(--surface2)' : 'transparent',
                      color: isSelected ? '#0a0a0a' : disabled ? 'var(--text3)' : '#fff',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all .12s',
                    }}>
                      {day}
                    </div>
                  )
                })}
              </div>
              {selectedDate && (
                <div style={{ borderTop: '.5px solid var(--border)', padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>Horário</div>
                  <div style={s.timeGrid}>
                    {TIMES.map(t => {
                      const taken = takenTimes.includes(t)
                      const sel = t === selectedTime
                      return (
                        <button key={t} type="button" disabled={taken} onClick={() => setSelectedTime(t)} style={{
                          ...s.timeBtn,
                          background: sel ? '#fff' : taken ? 'var(--surface2)' : 'transparent',
                          color: sel ? '#0a0a0a' : taken ? 'var(--text3)' : '#fff',
                          borderColor: sel ? '#fff' : taken ? 'var(--border)' : 'var(--border2)',
                          cursor: taken ? 'not-allowed' : 'pointer',
                          fontWeight: sel ? 600 : 400,
                          textDecoration: taken ? 'line-through' : 'none',
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

          {/* Personal info */}
          <div style={s.section}>
            <div style={s.sectionLabel}>Seus dados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={s.formGrid}>
                <div>
                  <label style={s.fieldLabel}>Nome</label>
                  <input style={s.input} type="text" placeholder="Seu nome" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={s.fieldLabel}>WhatsApp</label>
                  <input style={s.input} type="text" placeholder="(xx) 9xxxx-xxxx" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={s.fieldLabel}>Veículo</label>
                <input style={s.input} type="text" placeholder="Ex: Gol Branco — HJK 1234" value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedService && selectedDate && selectedTime && (
            <div style={{ background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Resumo</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>{selectedService.name}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{selectedService.priceDisplay}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                </span>
                <span style={{ color: '#fff', fontSize: 13 }}>{selectedTime}</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Salvando...' : 'Confirmar agendamento'}
          </button>
        </form>
      </div>
    </div>
  )
}
