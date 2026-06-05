'use client'

import { useEffect, useState } from 'react'
import { supabase, Booking, BookingStatus } from '@/lib/supabase'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const TIMES = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00']

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<BookingStatus, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  confirmed: { bg: 'var(--green-bg)',   color: 'var(--green)',   border: 'var(--green-border)' },
  completed: { bg: '#141414',           color: '#555',           border: '#282828' },
  cancelled: { bg: 'var(--red-bg)',     color: 'var(--red)',     border: 'var(--red-border)' },
}

function toLocalDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00')
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(first).fill(null)
  for (let i = 1; i <= total; i++) days.push(i)
  return days
}

function Badge({ status }: { status: BookingStatus }) {
  const c = STATUS_COLORS[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: c.bg, color: c.color, border: `.5px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function Btn({ children, onClick, color, disabled }: { children: string; onClick: () => void; color?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: 'transparent', border: `.5px solid ${color ?? 'var(--border2)'}`,
      color: color ?? 'var(--text2)', fontSize: 11, padding: '4px 10px', borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: disabled ? 0.4 : 1,
    }}>
      {children}
    </button>
  )
}

export default function AdminPage() {
  const today = new Date()
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [view, setView] = useState<'agenda' | 'calendar' | 'all'>('agenda')

  // Agenda view
  const [agendaDate, setAgendaDate] = useState(today.toISOString().split('T')[0])
  const [agendaBookings, setAgendaBookings] = useState<Booking[]>([])

  // Calendar view
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calBookings, setCalBookings] = useState<Booking[]>([])
  const [calSelected, setCalSelected] = useState('')

  // All view
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [searchQ, setSearchQ] = useState('')

  const [loading, setLoading] = useState(false)

  async function login() {
    const correctPw = process.env.NEXT_PUBLIC_ADMIN_PW ?? 'garagem2024'
    if (pw === correctPw) {
      setAuth(true)
    } else {
      alert('Senha incorreta')
    }
  }

  async function loadAgenda(date: string) {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').eq('date', date).order('time')
    setAgendaBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  async function loadCalendar(year: number, month: number) {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
    const { data } = await supabase.from('bookings').select('*').gte('date', start).lte('date', end).neq('status', 'cancelled')
    setCalBookings((data as Booking[]) ?? [])
  }

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').order('date', { ascending: false }).order('time')
    setAllBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (auth) { loadAgenda(agendaDate); loadCalendar(calYear, calMonth); loadAll() } }, [auth])
  useEffect(() => { if (auth) loadAgenda(agendaDate) }, [agendaDate])
  useEffect(() => { if (auth) loadCalendar(calYear, calMonth) }, [calYear, calMonth])

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setAgendaBookings(p => p.map(b => b.id === id ? { ...b, status } : b))
    setAllBookings(p => p.map(b => b.id === id ? { ...b, status } : b))
    setCalBookings(p => p.map(b => b.id === id ? { ...b, status } : b))
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg)' },
    header: { background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    logoIcon: { width: 34, height: 34, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
    logoName: { fontSize: 16, fontWeight: 600, color: '#fff' },
    logoSub: { fontSize: 10, color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase' },
    tabs: { display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' },
    tab: { fontSize: 13, fontWeight: 500, padding: '12px 0', marginRight: 24, cursor: 'pointer', border: 'none', background: 'transparent', transition: 'color .15s' },
    body: { maxWidth: 760, margin: '0 auto', padding: '24px 16px 60px' },
    input: { background: 'var(--surface)', border: '.5px solid var(--border2)', color: '#fff', fontSize: 13, padding: '9px 12px', borderRadius: 8, outline: 'none', fontFamily: 'inherit' },
    card: { background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
    bkRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '.5px solid var(--border)', transition: 'background .12s' },
    statCard: { background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 10, padding: '14px 16px' },
    statLabel: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 },
    statVal: { fontSize: 22, fontWeight: 600, color: '#fff' },
    statSub: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  }

  if (!auth) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '.5px solid var(--border)', borderRadius: 12, padding: '32px 28px', width: 300 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Garagem V8</div>
          <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Painel do dono</div>
        </div>
        <input type="password" placeholder="Senha" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={{ ...s.input, width: '100%', marginBottom: 10 }} />
        <button onClick={login} style={{ width: '100%', background: '#fff', color: '#0a0a0a', border: 'none', fontSize: 14, fontWeight: 600, padding: 11, borderRadius: 8, cursor: 'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  )

  // Stats across all bookings
  const stats = {
    today: agendaBookings.filter(b => b.status !== 'cancelled').length,
    pending: allBookings.filter(b => b.status === 'pending').length,
    revenue: agendaBookings.filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + (parseFloat((b.price ?? '').replace('R$', '').replace(',', '.')) || 0), 0),
    total: allBookings.length,
  }

  // ── AGENDA VIEW ──────────────────────────────────────
  const AgendaView = () => {
    const slots = TIMES.map(t => ({ time: t, booking: agendaBookings.find(b => b.time === t) }))
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input type="date" value={agendaDate} onChange={e => setAgendaDate(e.target.value)} style={s.input} />
          <button onClick={() => { setAgendaDate(today.toISOString().split('T')[0]); loadAgenda(today.toISOString().split('T')[0]) }}
            style={{ ...s.input, cursor: 'pointer', color: 'var(--text2)', fontSize: 12 }}>Hoje</button>
          <button onClick={() => loadAgenda(agendaDate)} style={{ ...s.input, cursor: 'pointer', color: 'var(--text2)', fontSize: 12 }}>↻</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'Hoje', val: stats.today, sub: 'agendamentos' },
            { label: 'Pendentes', val: stats.pending, sub: 'todos os dias' },
            { label: 'Faturamento', val: `R$${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, sub: 'hoje (estimado)' },
            { label: 'Total', val: stats.total, sub: 'no sistema' },
          ].map(s2 => (
            <div key={s2.label} style={s.statCard}>
              <div style={s.statLabel}>{s2.label}</div>
              <div style={s.statVal}>{s2.val}</div>
              <div style={s.statSub}>{s2.sub}</div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Carregando...</div>
          ) : (
            slots.map((slot, i) => (
              <div key={slot.time} style={{ ...s.bkRow, borderBottom: i < slots.length - 1 ? '.5px solid var(--border)' : 'none', background: slot.booking ? 'transparent' : 'var(--surface)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: slot.booking ? '#fff' : 'var(--text3)', minWidth: 48 }}>{slot.time}</div>
                {slot.booking ? (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                        {slot.booking.name} {slot.booking.vehicle_type === 'moto' ? '🏍' : ''}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slot.booking.service} · {slot.booking.vehicle} · {slot.booking.whatsapp}{slot.booking.price ? ` · ${slot.booking.price}` : ''}
                      </div>
                    </div>
                    <Badge status={slot.booking.status} />
                    <div style={{ display: 'flex', gap: 5 }}>
                      {slot.booking.status === 'pending' && <Btn color="var(--green)" onClick={() => updateStatus(slot.booking!.id, 'confirmed')}>Confirmar</Btn>}
                      {slot.booking.status === 'confirmed' && <Btn onClick={() => updateStatus(slot.booking!.id, 'completed')}>Concluir</Btn>}
                      {(slot.booking.status === 'pending' || slot.booking.status === 'confirmed') && <Btn color="var(--red)" onClick={() => updateStatus(slot.booking!.id, 'cancelled')}>Cancelar</Btn>}
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--text3)' }}>Disponível</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── CALENDAR VIEW ────────────────────────────────────
  const CalendarView = () => {
    const calDays = getCalendarDays(calYear, calMonth)
    const bookingsByDate: Record<string, Booking[]> = {}
    calBookings.forEach(b => {
      if (!bookingsByDate[b.date]) bookingsByDate[b.date] = []
      bookingsByDate[b.date].push(b)
    })
    const selectedDayBookings = calSelected ? (bookingsByDate[calSelected] ?? []) : []

    function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
    function nextMonth() { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '.5px solid var(--border)' }}>
              <button type="button" onClick={prevMonth} style={{ background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', width: 30, height: 30, borderRadius: 7, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{MONTHS_FULL[calMonth]} {calYear}</span>
              <button type="button" onClick={nextMonth} style={{ background: 'transparent', border: '.5px solid var(--border2)', color: 'var(--text2)', width: 30, height: 30, borderRadius: 7, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '12px 10px 14px' }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', fontWeight: 500, paddingBottom: 10 }}>{d}</div>)}
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />
                const str = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const bks = bookingsByDate[str] ?? []
                const isSelected = str === calSelected
                const isToday = new Date(calYear, calMonth, day).toDateString() === today.toDateString()
                return (
                  <div key={i} onClick={() => setCalSelected(str)} style={{ textAlign: 'center', padding: '7px 4px', borderRadius: 8, cursor: 'pointer', background: isSelected ? '#fff' : isToday ? '#1c1c1c' : 'transparent', transition: 'background .12s', position: 'relative' }}>
                    <span style={{ fontSize: 13, color: isSelected ? '#0a0a0a' : '#fff', fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    {bks.length > 0 && !isSelected && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
                        {bks.slice(0, 3).map((_, di) => <div key={di} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)' }} />)}
                      </div>
                    )}
                    {bks.length > 0 && isSelected && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
                        {bks.slice(0, 3).map((_, di) => <div key={di} style={{ width: 4, height: 4, borderRadius: '50%', background: '#0a0a0a' }} />)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={s.card}>
            <div style={{ padding: '13px 16px', borderBottom: '.5px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                {calSelected ? toLocalDate(calSelected).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : 'Selecione um dia'}
              </div>
              {calSelected && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{selectedDayBookings.length} agendamento(s)</div>}
            </div>
            {!calSelected ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Clique em um dia para ver os agendamentos</div>
            ) : selectedDayBookings.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Nenhum agendamento</div>
            ) : (
              selectedDayBookings.sort((a, b) => a.time.localeCompare(b.time)).map((bk, i) => (
                <div key={bk.id} style={{ ...s.bkRow, borderBottom: i < selectedDayBookings.length - 1 ? '.5px solid var(--border)' : 'none', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{bk.time}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{bk.name}</span>
                    </div>
                    <Badge status={bk.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{bk.service} · {bk.vehicle}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {bk.status === 'pending' && <Btn color="var(--green)" onClick={() => updateStatus(bk.id, 'confirmed')}>Confirmar</Btn>}
                    {bk.status === 'confirmed' && <Btn onClick={() => updateStatus(bk.id, 'completed')}>Concluir</Btn>}
                    {(bk.status === 'pending' || bk.status === 'confirmed') && <Btn color="var(--red)" onClick={() => updateStatus(bk.id, 'cancelled')}>Cancelar</Btn>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── ALL BOOKINGS VIEW ────────────────────────────────
  const AllView = () => {
    const filtered = allBookings
      .filter(b => filterStatus === 'all' || b.status === filterStatus)
      .filter(b => {
        if (!searchQ) return true
        const q = searchQ.toLowerCase()
        return b.name.toLowerCase().includes(q) || b.vehicle.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.whatsapp.includes(q)
      })

    const grouped: Record<string, Booking[]> = {}
    filtered.forEach(b => {
      if (!grouped[b.date]) grouped[b.date] = []
      grouped[b.date].push(b)
    })
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
          <input type="text" placeholder="Buscar nome, veículo, serviço..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ ...s.input, flex: 1, minWidth: 200 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | 'all')} style={s.input}>
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button onClick={loadAll} style={{ ...s.input, cursor: 'pointer', color: 'var(--text2)', fontSize: 12 }}>↻</button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>{filtered.length} resultado(s)</div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Carregando...</div>
        ) : dates.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Nenhum agendamento encontrado.</div>
        ) : (
          dates.map(date => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {toLocalDate(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div style={s.card}>
                {grouped[date].map((bk, i) => (
                  <div key={bk.id} style={{ ...s.bkRow, borderBottom: i < grouped[date].length - 1 ? '.5px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', minWidth: 44 }}>{bk.time}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{bk.name} {bk.vehicle_type === 'moto' ? '🏍' : ''}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bk.service} · {bk.vehicle} · {bk.whatsapp}{bk.price ? ` · ${bk.price}` : ''}
                      </div>
                    </div>
                    <Badge status={bk.status} />
                    <div style={{ display: 'flex', gap: 5 }}>
                      {bk.status === 'pending' && <Btn color="var(--green)" onClick={() => updateStatus(bk.id, 'confirmed')}>Confirmar</Btn>}
                      {bk.status === 'confirmed' && <Btn onClick={() => updateStatus(bk.id, 'completed')}>Concluir</Btn>}
                      {(bk.status === 'pending' || bk.status === 'confirmed') && <Btn color="var(--red)" onClick={() => updateStatus(bk.id, 'cancelled')}>Cancelar</Btn>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  const tabStyle = (t: string): React.CSSProperties => ({
    ...s.tab,
    color: view === t ? '#fff' : 'var(--text3)',
    borderBottom: view === t ? '2px solid #fff' : '2px solid transparent',
  })

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🚗</div>
          <div>
            <div style={s.logoName}>Garagem V8</div>
            <div style={s.logoSub}>Painel do dono</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 11, color: 'var(--text3)', border: '.5px solid var(--border2)', padding: '5px 12px', borderRadius: 20 }}>← Site</a>
      </header>

      <div style={s.tabs}>
        <button style={tabStyle('agenda')} onClick={() => setView('agenda')}>Agenda do dia</button>
        <button style={tabStyle('calendar')} onClick={() => setView('calendar')}>Calendário</button>
        <button style={tabStyle('all')} onClick={() => setView('all')}>Todos os agendamentos</button>
      </div>

      <div style={s.body}>
        {view === 'agenda' && <AgendaView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'all' && <AllView />}
      </div>
    </div>
  )
}
