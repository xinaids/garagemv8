'use client'

import { useEffect, useState } from 'react'
import { supabase, Booking, BookingStatus } from '@/lib/supabase'

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_STYLE: Record<BookingStatus, React.CSSProperties> = {
  pending:   { background: '#1a1500', color: '#ccaa00', border: '.5px solid #2a2000' },
  confirmed: { background: '#001508', color: '#00bb55', border: '.5px solid #003318' },
  completed: { background: '#141414', color: '#555',    border: '.5px solid #282828' },
  cancelled: { background: '#1a0808', color: '#aa3333', border: '.5px solid #2a1010' },
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all')

  function login() {
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PW ?? 'garagem2024')) {
      setAuth(true)
      loadBookings()
    } else {
      alert('Senha incorreta')
    }
  }

  async function loadBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', filterDate)
      .order('time', { ascending: true })
    setBookings((data as Booking[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (auth) loadBookings()
  }, [filterDate, auth])

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const filtered = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus)

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => {
        const n = parseFloat((b.price ?? '').replace('R$', '').replace('.', '').replace(',', '.'))
        return sum + (isNaN(n) ? 0 : n)
      }, 0),
  }

  const inputStyle: React.CSSProperties = {
    background: '#111', border: '.5px solid #2a2a2a', color: '#fff',
    fontSize: 13, padding: '8px 11px', borderRadius: 7, outline: 'none', fontFamily: 'inherit',
  }

  if (!auth) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111', border: '.5px solid #1e1e1e', borderRadius: 12, padding: '32px 28px', width: 300 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>Painel Garagem V8</div>
            <div style={{ color: '#444', fontSize: 12, marginTop: 4 }}>Acesso restrito</div>
          </div>
          <input type="password" placeholder="Senha" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
          <button onClick={login} style={{ width: '100%', background: '#fff', color: '#0a0a0a', border: 'none', fontSize: 14, fontWeight: 500, padding: 11, borderRadius: 7, cursor: 'pointer' }}>
            Entrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚗</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', letterSpacing: '.04em' }}>Garagem V8</div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: '.1em', textTransform: 'uppercase' }}>Painel do dono</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#444', textDecoration: 'none', border: '.5px solid #2a2a2a', padding: '5px 12px', borderRadius: 20 }}>← Site</a>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={inputStyle} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | 'all')} style={inputStyle}>
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button onClick={loadBookings} style={{ background: 'transparent', border: '.5px solid #333', color: '#aaa', fontSize: 12, padding: '8px 14px', borderRadius: 7, cursor: 'pointer' }}>
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Confirmados', value: stats.confirmed },
            { label: 'Concluídos', value: stats.completed },
            { label: 'Faturamento', value: `R$${stats.revenue.toFixed(2).replace('.', ',')}` },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '.5px solid #1e1e1e', borderRadius: 9, padding: 12 }}>
              <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: 40 }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#333', fontSize: 13, textAlign: 'center', padding: 40 }}>Nenhum agendamento para esta data.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(bk => (
              <div key={bk.id} style={{ background: '#111', border: '.5px solid #1e1e1e', borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', minWidth: 44 }}>{bk.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                    {bk.name} {bk.vehicle_type === 'moto' ? '🏍' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bk.service} · {bk.vehicle} · {bk.whatsapp}
                    {bk.price ? ` · ${bk.price}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 500, whiteSpace: 'nowrap', ...STATUS_STYLE[bk.status] }}>
                  {STATUS_LABEL[bk.status]}
                </span>
                <div style={{ display: 'flex', gap: 5 }}>
                  {bk.status === 'pending' && (
                    <Btn onClick={() => updateStatus(bk.id, 'confirmed')} green>Confirmar</Btn>
                  )}
                  {bk.status === 'confirmed' && (
                    <Btn onClick={() => updateStatus(bk.id, 'completed')}>Concluir</Btn>
                  )}
                  {bk.status !== 'cancelled' && bk.status !== 'completed' && (
                    <Btn onClick={() => updateStatus(bk.id, 'cancelled')}>Cancelar</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function Btn({ children, onClick, green }: { children: string; onClick: () => void; green?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      border: `.5px solid ${green ? '#00a050' : '#2a2a2a'}`,
      color: green ? '#00a050' : '#666',
      fontSize: 10, padding: '4px 9px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}
