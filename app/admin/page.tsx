'use client'

import { useEffect, useState } from 'react'
import { supabase, Booking, BookingStatus } from '@/lib/supabase'

const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS = ['D','S','T','Q','Q','S','S']
const TIMES = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00']

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<BookingStatus, { bg: string; color: string }> = {
  pending:   { bg: '#2a1e00', color: '#eab308' },
  confirmed: { bg: '#052010', color: '#22c55e' },
  completed: { bg: '#1a1a1a', color: '#555' },
  cancelled: { bg: '#1a0505', color: '#ef4444' },
}

function toLocal(d: string) { return new Date(d + 'T12:00:00') }
function fmtDate(d: string, opts: Intl.DateTimeFormatOptions) { return toLocal(d).toLocaleDateString('pt-BR', opts) }
function getCalDays(y: number, m: number) {
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
}

function Badge({ status }: { status: BookingStatus }) {
  const c = STATUS_COLORS[status]
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: c.bg, color: c.color, letterSpacing: '.03em' }}>{STATUS_LABEL[status]}</span>
}

export default function AdminPage() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [view, setView] = useState<'agenda' | 'cal' | 'all'>('agenda')

  const [agendaDate, setAgendaDate] = useState(todayStr)
  const [agendaBookings, setAgendaBookings] = useState<Booking[]>([])

  const [calY, setCalY] = useState(today.getFullYear())
  const [calM, setCalM] = useState(today.getMonth())
  const [calBookings, setCalBookings] = useState<Booking[]>([])
  const [calDay, setCalDay] = useState('')

  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(false)

  async function login() {
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PW ?? 'garagem2024')) { setAuth(true) }
    else alert('Senha incorreta')
  }

  async function loadAgenda(d: string) {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').eq('date', d).order('time')
    setAgendaBookings((data as Booking[]) ?? [])
    setLoading(false)
  }
  async function loadCal(y: number, m: number) {
    const s = `${y}-${String(m+1).padStart(2,'0')}-01`
    const e = `${y}-${String(m+1).padStart(2,'0')}-${new Date(y,m+1,0).getDate()}`
    const { data } = await supabase.from('bookings').select('*').gte('date',s).lte('date',e).neq('status','cancelled')
    setCalBookings((data as Booking[]) ?? [])
  }
  async function loadAll() {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').order('date',{ascending:false}).order('time')
    setAllBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (auth) { loadAgenda(agendaDate); loadCal(calY, calM); loadAll() } }, [auth])
  useEffect(() => { if (auth) loadAgenda(agendaDate) }, [agendaDate])
  useEffect(() => { if (auth) loadCal(calY, calM) }, [calY, calM])

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    const up = (b: Booking) => b.id === id ? { ...b, status } : b
    setAgendaBookings(p => p.map(up))
    setAllBookings(p => p.map(up))
    setCalBookings(p => p.map(up))
  }

  // ── LOGIN ─────────────────────────────────────────────
  if (!auth) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:16, padding:'36px 28px', width:'100%', maxWidth:320 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, background:'#fff', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 14px' }}>🚗</div>
          <div style={{ color:'#fff', fontSize:18, fontWeight:700 }}>Garagem V8</div>
          <div style={{ color:'var(--text3)', fontSize:12, marginTop:4 }}>Acesso do dono</div>
        </div>
        <input type="password" placeholder="Senha" value={pw}
          onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
          style={{ width:'100%', background:'#1a1a1a', border:'.5px solid var(--border2)', color:'#fff', fontSize:15, padding:'13px 14px', borderRadius:10, outline:'none', marginBottom:10, fontFamily:'inherit' }} />
        <button onClick={login} style={{ width:'100%', background:'#fff', color:'#0a0a0a', border:'none', fontSize:15, fontWeight:700, padding:13, borderRadius:10, cursor:'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  )

  // Stats
  const todayActive = agendaBookings.filter(b => b.status !== 'cancelled')
  const revenue = todayActive.reduce((acc, b) => {
    const n = parseFloat((b.price??'').replace('R$','').replace('.','').replace(',','.'))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)
  const pending = allBookings.filter(b => b.status === 'pending').length

  // ── AGENDA ────────────────────────────────────────────
  const AgendaView = () => {
    const slots = TIMES.map(t => ({ time: t, bk: agendaBookings.find(b => b.time === t) }))
    const isToday = agendaDate === todayStr

    function prevDay() {
      const d = new Date(agendaDate + 'T12:00:00')
      d.setDate(d.getDate() - 1)
      setAgendaDate(d.toISOString().split('T')[0])
    }
    function nextDay() {
      const d = new Date(agendaDate + 'T12:00:00')
      d.setDate(d.getDate() + 1)
      setAgendaDate(d.toISOString().split('T')[0])
    }

    return (
      <div>
        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
          {[
            { label:'Hoje', val: todayActive.length, unit:'atend.' },
            { label:'Pendentes', val: pending, unit:'total' },
            { label:'Estimado', val: `R$${Math.round(revenue)}`, unit:'hoje' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#fff', lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:3 }}>{s.unit}</div>
            </div>
          ))}
        </div>

        {/* Date nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
          <button onClick={prevDay} style={{ background:'transparent', border:'none', color:'var(--text2)', fontSize:22, cursor:'pointer', padding:'0 4px', lineHeight:1 }}>‹</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>
              {isToday ? 'Hoje' : fmtDate(agendaDate, { weekday:'long' }).replace(/^\w/, c => c.toUpperCase())}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
              {fmtDate(agendaDate, { day:'2-digit', month:'long' })}
            </div>
          </div>
          <button onClick={nextDay} style={{ background:'transparent', border:'none', color:'var(--text2)', fontSize:22, cursor:'pointer', padding:'0 4px', lineHeight:1 }}>›</button>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text3)', fontSize:13 }}>Carregando...</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {slots.map(({ time, bk }) => (
              <div key={time} style={{ background:'var(--surface)', border:`.5px solid ${bk ? 'var(--border2)' : 'var(--border)'}`, borderRadius:12, overflow:'hidden' }}>
                {bk ? (
                  <div style={{ padding:'14px 16px' }}>
                    {/* Top row */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--text3)', minWidth:40 }}>{time}</span>
                        <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{bk.name} {bk.vehicle_type==='moto'?'🏍':''}</span>
                      </div>
                      <Badge status={bk.status} />
                    </div>
                    {/* Service + vehicle */}
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4, paddingLeft:50 }}>{bk.service}</div>
                    <div style={{ fontSize:12, color:'var(--text3)', paddingLeft:50, marginBottom:bk.price?4:0 }}>{bk.vehicle}</div>
                    {bk.price && <div style={{ fontSize:13, fontWeight:600, color:'#fff', paddingLeft:50, marginBottom:8 }}>{bk.price}</div>}
                    {/* WhatsApp */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:50 }}>
                      <a href={`https://wa.me/55${bk.whatsapp.replace(/\D/g,'')}`} target="_blank"
                        style={{ fontSize:12, color:'#22c55e', display:'flex', alignItems:'center', gap:4 }}>
                        📱 {bk.whatsapp}
                      </a>
                      {/* Actions */}
                      <div style={{ display:'flex', gap:6 }}>
                        {bk.status==='pending' && (
                          <button onClick={()=>updateStatus(bk.id,'confirmed')}
                            style={{ background:'#052010', border:'.5px solid #22c55e', color:'#22c55e', fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, cursor:'pointer' }}>
                            Confirmar
                          </button>
                        )}
                        {bk.status==='confirmed' && (
                          <button onClick={()=>updateStatus(bk.id,'completed')}
                            style={{ background:'#1a1a1a', border:'.5px solid var(--border2)', color:'var(--text2)', fontSize:12, fontWeight:600, padding:'6px 12px', borderRadius:8, cursor:'pointer' }}>
                            Concluir
                          </button>
                        )}
                        {(bk.status==='pending'||bk.status==='confirmed') && (
                          <button onClick={()=>updateStatus(bk.id,'cancelled')}
                            style={{ background:'transparent', border:'.5px solid #1a0505', color:'#ef4444', fontSize:12, padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text3)', minWidth:40 }}>{time}</span>
                    <span style={{ fontSize:12, color:'var(--border2)' }}>Disponível</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── CALENDÁRIO ────────────────────────────────────────
  const CalView = () => {
    const calDays = getCalDays(calY, calM)
    const byDate: Record<string, Booking[]> = {}
    calBookings.forEach(b => { if (!byDate[b.date]) byDate[b.date] = []; byDate[b.date].push(b) })
    const dayBks = calDay ? (byDate[calDay] ?? []).sort((a,b)=>a.time.localeCompare(b.time)) : []

    return (
      <div>
        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={()=>{ if(calM===0){setCalM(11);setCalY(y=>y-1)}else setCalM(m=>m-1) }}
            style={{ background:'var(--surface)', border:'.5px solid var(--border)', color:'#fff', width:40, height:40, borderRadius:10, fontSize:18, cursor:'pointer' }}>‹</button>
          <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{MONTHS_FULL[calM]} {calY}</span>
          <button onClick={()=>{ if(calM===11){setCalM(0);setCalY(y=>y+1)}else setCalM(m=>m+1) }}
            style={{ background:'var(--surface)', border:'.5px solid var(--border)', color:'#fff', width:40, height:40, borderRadius:10, fontSize:18, cursor:'pointer' }}>›</button>
        </div>

        {/* Calendar grid */}
        <div style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:12, padding:'12px 10px 16px', marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
            {DAYS.map((d,i) => <div key={i} style={{ textAlign:'center', fontSize:10, fontWeight:600, color:'var(--text3)', letterSpacing:'.06em', padding:'0 0 6px' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px 0' }}>
            {calDays.map((day, i) => {
              if (!day) return <div key={i} />
              const str = `${calY}-${String(calM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const bks = byDate[str] ?? []
              const isSel = str === calDay
              const isToday = new Date(calY,calM,day).toDateString() === today.toDateString()
              return (
                <div key={i} onClick={()=>setCalDay(str)} style={{ textAlign:'center', padding:'8px 2px', borderRadius:8, cursor:'pointer',
                  background: isSel ? '#fff' : isToday ? '#1c1c1c' : 'transparent' }}>
                  <div style={{ fontSize:13, fontWeight: isSel||isToday ? 700 : 400, color: isSel ? '#0a0a0a' : '#fff', lineHeight:1 }}>{day}</div>
                  {bks.length > 0 && (
                    <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:4 }}>
                      {bks.slice(0,3).map((_,di) => <div key={di} style={{ width:4, height:4, borderRadius:'50%', background: isSel ? '#0a0a0a' : '#22c55e' }} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day */}
        {calDay && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>
              {fmtDate(calDay, { weekday:'long', day:'2-digit', month:'long' }).replace(/^\w/, c=>c.toUpperCase())}
              <span style={{ color:'var(--text3)', fontWeight:400, marginLeft:6 }}>· {dayBks.length} agendamento(s)</span>
            </div>
            {dayBks.length === 0 ? (
              <div style={{ textAlign:'center', padding:24, color:'var(--text3)', fontSize:13 }}>Nenhum agendamento</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {dayBks.map(bk => (
                  <div key={bk.id} style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--text3)' }}>{bk.time}</span>
                        <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{bk.name}</span>
                      </div>
                      <Badge status={bk.status} />
                    </div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:2 }}>{bk.service}</div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginBottom:bk.price?6:10 }}>{bk.vehicle}</div>
                    {bk.price && <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:10 }}>{bk.price}</div>}
                    <div style={{ display:'flex', gap:6 }}>
                      {bk.status==='pending' && <ActionBtn green onClick={()=>updateStatus(bk.id,'confirmed')}>Confirmar</ActionBtn>}
                      {bk.status==='confirmed' && <ActionBtn onClick={()=>updateStatus(bk.id,'completed')}>Concluir</ActionBtn>}
                      {(bk.status==='pending'||bk.status==='confirmed') && <ActionBtn red onClick={()=>updateStatus(bk.id,'cancelled')}>Cancelar</ActionBtn>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── TODOS ─────────────────────────────────────────────
  const AllView = () => {
    const filtered = allBookings
      .filter(b => filterStatus==='all' || b.status===filterStatus)
      .filter(b => {
        if (!search) return true
        const q = search.toLowerCase()
        return b.name.toLowerCase().includes(q) || b.vehicle.toLowerCase().includes(q) || b.service.toLowerCase().includes(q)
      })

    const grouped: Record<string, Booking[]> = {}
    filtered.forEach(b => { if (!grouped[b.date]) grouped[b.date]=[]; grouped[b.date].push(b) })
    const dates = Object.keys(grouped).sort((a,b)=>b.localeCompare(a))

    return (
      <div>
        {/* Search + filter */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          <input type="text" placeholder="🔍  Buscar nome, veículo ou serviço" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:'100%', background:'var(--surface)', border:'.5px solid var(--border2)', color:'#fff', fontSize:14, padding:'11px 14px', borderRadius:10, outline:'none', fontFamily:'inherit' }} />
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            {(['all','pending','confirmed','completed','cancelled'] as const).map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                flexShrink:0, padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
                background: filterStatus===s ? '#fff' : 'var(--surface)',
                border: `.5px solid ${filterStatus===s ? '#fff' : 'var(--border2)'}`,
                color: filterStatus===s ? '#0a0a0a' : 'var(--text3)',
              }}>
                {s==='all' ? 'Todos' : STATUS_LABEL[s as BookingStatus]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>{filtered.length} resultado(s)</div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Carregando...</div>
        ) : dates.length===0 ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text3)', fontSize:13 }}>Nenhum agendamento encontrado.</div>
        ) : dates.map(date => (
          <div key={date} style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:8 }}>
              {fmtDate(date,{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {grouped[date].map(bk => (
                <div key={bk.id} style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:12, padding:'13px 15px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text3)' }}>{bk.time}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{bk.name} {bk.vehicle_type==='moto'?'🏍':''}</span>
                    </div>
                    <Badge status={bk.status} />
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:1 }}>{bk.service}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginBottom: bk.price ? 4 : 8 }}>{bk.vehicle} · {bk.whatsapp}</div>
                  {bk.price && <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:8 }}>{bk.price}</div>}
                  {(bk.status==='pending'||bk.status==='confirmed') && (
                    <div style={{ display:'flex', gap:6 }}>
                      {bk.status==='pending' && <ActionBtn green onClick={()=>updateStatus(bk.id,'confirmed')}>Confirmar</ActionBtn>}
                      {bk.status==='confirmed' && <ActionBtn onClick={()=>updateStatus(bk.id,'completed')}>Concluir</ActionBtn>}
                      <ActionBtn red onClick={()=>updateStatus(bk.id,'cancelled')}>Cancelar</ActionBtn>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const NAV = [
    { id:'agenda', icon:'📅', label:'Agenda' },
    { id:'cal',    icon:'🗓',  label:'Calendário' },
    { id:'all',    icon:'📋',  label:'Todos' },
  ] as const

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:72 }}>
      {/* Header */}
      <header style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'#fff', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🚗</div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Garagem V8</div>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.08em' }}>Painel do dono</div>
          </div>
        </div>
        <a href="/" style={{ fontSize:12, color:'var(--text3)', border:'.5px solid var(--border2)', padding:'6px 12px', borderRadius:20 }}>← Site</a>
      </header>

      {/* Content */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 14px' }}>
        {view==='agenda' && <AgendaView />}
        {view==='cal'    && <CalView />}
        {view==='all'    && <AllView />}
      </div>

      {/* Bottom nav */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--bg)', borderTop:'1px solid var(--border)', display:'flex', zIndex:20 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>setView(n.id)} style={{
            flex:1, background:'transparent', border:'none', cursor:'pointer', padding:'10px 0 12px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, fontWeight:600, color: view===n.id ? '#fff' : 'var(--text3)', letterSpacing:'.04em' }}>{n.label}</span>
            {view===n.id && <div style={{ width:20, height:2, background:'#fff', borderRadius:1, marginTop:1 }} />}
          </button>
        ))}
      </nav>
    </div>
  )
}

function ActionBtn({ children, onClick, green, red }: { children: string; onClick: () => void; green?: boolean; red?: boolean }) {
  const bg = green ? '#052010' : red ? '#1a0505' : '#1a1a1a'
  const border = green ? '#22c55e' : red ? '#ef4444' : 'var(--border2)'
  const color = green ? '#22c55e' : red ? '#ef4444' : 'var(--text2)'
  return (
    <button onClick={onClick} style={{ background:bg, border:`.5px solid ${border}`, color, fontSize:12, fontWeight:600, padding:'7px 14px', borderRadius:8, cursor:'pointer' }}>
      {children}
    </button>
  )
}
