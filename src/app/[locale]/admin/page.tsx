'use client'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase'

// Only this Supabase account can open the dashboard.
const OWNER_ID = 'f4e58c4a-8753-4967-a60b-fb89b0094807'

interface Listing {
  id: string; title: string; price_label: string; category: string; subcategory: string
  city: string; status: string | null; views: number | null; created_at: string
  user_id: string; is_featured: boolean | null; is_top: boolean | null
  boost_expires_at: string | null; contact_name: string | null; contact_phone: string | null
}

type Tab = 'overview' | 'listings' | 'sellers' | 'reports' | 'revenue'

const fmt = (n: number) => n.toLocaleString()
const money = (n: number) => 'ETB ' + n.toLocaleString()

export default function Admin() {
  const locale = useLocale()
  const [authState, setAuthState] = useState<'checking' | 'denied' | 'ok'>('checking')
  const [tab, setTab] = useState<Tab>('overview')
  const [listings, setListings] = useState<Listing[]>([])
  const [boosts, setBoosts] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Listing | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && data.user.id === OWNER_ID) {
        setAuthState('ok')
        loadAll()
      } else {
        setAuthState('denied')
      }
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const supabase = createClient()
    const [l, b, r] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('boost_payments').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(500),
    ])
    setListings((l.data as Listing[]) || [])
    setBoosts(b.data || [])
    setReports(r.data || [])
    setLoading(false)
  }

  async function toggleFeatured(l: Listing) {
    setBusyId(l.id)
    const supabase = createClient()
    await supabase.from('listings').update({ is_featured: !l.is_featured }).eq('id', l.id)
    setListings(prev => prev.map(x => x.id === l.id ? { ...x, is_featured: !l.is_featured } : x))
    setBusyId(null)
  }

  async function setStatus(l: Listing, status: string) {
    setBusyId(l.id)
    const supabase = createClient()
    await supabase.from('listings').update({ status }).eq('id', l.id)
    setListings(prev => prev.map(x => x.id === l.id ? { ...x, status } : x))
    setBusyId(null)
  }

  async function doDelete(l: Listing) {
    setBusyId(l.id)
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', l.id)
    setListings(prev => prev.filter(x => x.id !== l.id))
    setBusyId(null)
    setConfirmDelete(null)
  }

  // ---- Derived stats ----
  const total = listings.length
  const active = listings.filter(l => (l.status || 'active') === 'active').length
  const hidden = listings.filter(l => l.status === 'hidden').length
  const featured = listings.filter(l => l.is_featured).length
  const boostedLive = listings.filter(l => l.boost_expires_at && new Date(l.boost_expires_at) > new Date()).length
  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0)
  const byCategory = listings.reduce((m: Record<string, number>, l) => { m[l.category] = (m[l.category] || 0) + 1; return m }, {})
  const revenue = boosts.reduce((s, b) => s + (Number(b.amount) || Number(b.amount_etb) || 0), 0)

  // sellers derived from listings (real user accounts live in Supabase Auth)
  const sellers = Object.values(listings.reduce((m: Record<string, any>, l) => {
    const k = l.user_id || 'unknown'
    if (!m[k]) m[k] = { user_id: k, name: l.contact_name || '—', phone: l.contact_phone || '—', count: 0, views: 0 }
    m[k].count++; m[k].views += (l.views || 0)
    if (l.contact_name && m[k].name === '—') m[k].name = l.contact_name
    if (l.contact_phone && m[k].phone === '—') m[k].phone = l.contact_phone
    return m
  }, {})) as any[]

  // ---- Styles ----
  const GREEN = '#078754'
  const shell: React.CSSProperties = { minHeight: '100vh', background: '#F6F7F9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display: 'flex' }
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #ECECEC', borderRadius: '14px' }
  const th: React.CSSProperties = { textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#9CA3AF', padding: '10px 14px', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { fontSize: '13px', color: '#222', padding: '12px 14px', borderBottom: '1px solid #F5F5F5', verticalAlign: 'middle' }
  const pill = (bg: string, c: string): React.CSSProperties => ({ fontSize: '11px', fontWeight: 700, background: bg, color: c, padding: '2px 9px', borderRadius: '20px', whiteSpace: 'nowrap' })
  const btn = (bg: string, c = '#fff'): React.CSSProperties => ({ fontSize: '12px', fontWeight: 600, background: bg, color: c, border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' })

  // ---- Guard states ----
  if (authState === 'checking') {
    return <div style={{ ...shell, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Checking access…</div>
    </div>
  }
  if (authState === 'denied') {
    return <div style={{ ...shell, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '40px' }}>🔒</div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0 }}>Admin access only</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', margin: 0 }}>
        This area is restricted to the Gohbay owner account. Sign in with the owner account to continue.
      </p>
      <a href={`/${locale}/login`} style={{ ...btn(GREEN), padding: '10px 20px', textDecoration: 'none', fontSize: '13px' }}>Go to login</a>
    </div>
  }

  const NAV: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '▦' },
    { key: 'listings', label: 'Listings', icon: '▤' },
    { key: 'sellers', label: 'Sellers', icon: '◍' },
    { key: 'reports', label: 'Reports', icon: '⚑' },
    { key: 'revenue', label: 'Boosts & Revenue', icon: '◆' },
  ]

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div style={{ ...card, padding: '16px 18px', flex: '1 1 150px', minWidth: 0 }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>{sub}</div>}
    </div>
  )

  return (
    <div style={shell}>
      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#0F1115', color: '#fff', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '4px 10px 18px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '2px' }}>GOHBAY</div>
          <div style={{ fontSize: '9px', color: '#6B7280', letterSpacing: '1.5px', marginTop: '2px' }}>ADMIN CONSOLE</div>
        </div>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', background: tab === n.key ? '#1C1F26' : 'transparent', color: tab === n.key ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '9px', padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: tab === n.key ? 700 : 500 }}>
            <span style={{ width: '16px', textAlign: 'center' }}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={loadAll} style={{ ...btn('#1C1F26'), padding: '9px', textAlign: 'center' }}>↻ Refresh data</button>
          <a href={`/${locale}`} style={{ fontSize: '12px', color: '#6B7280', textDecoration: 'none', textAlign: 'center', padding: '4px' }}>← Back to site</a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '24px 28px', minWidth: 0, overflowX: 'auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>
          {NAV.find(n => n.key === tab)!.label}
        </h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 22px' }}>
          {loading ? 'Loading live data…' : `Live from your database · ${fmt(total)} listings`}
        </p>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <Stat label="Total listings" value={fmt(total)} sub={`${fmt(active)} active · ${fmt(hidden)} hidden`} />
              <Stat label="Featured" value={fmt(featured)} sub={`${fmt(boostedLive)} boost live`} />
              <Stat label="Total views" value={fmt(totalViews)} />
              <Stat label="Sellers" value={fmt(sellers.length)} sub="with at least 1 listing" />
              <Stat label="Open reports" value={fmt(reports.length)} sub={reports.length ? 'needs review' : 'all clear'} />
              <Stat label="Boost revenue" value={money(revenue)} sub={boosts.length ? `${boosts.length} payments` : 'No payments yet'} />
            </div>
            <div style={{ ...card, padding: '18px 20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '14px' }}>Listings by category</div>
              {Object.keys(byCategory).length === 0 ? (
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No listings yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, n]) => {
                    const pct = total ? Math.round((n / total) * 100) : 0
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '120px', fontSize: '13px', color: '#444', flexShrink: 0 }}>{cat}</div>
                        <div style={{ flex: 1, background: '#F0F2F4', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: GREEN, height: '100%' }} />
                        </div>
                        <div style={{ width: '54px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#111' }}>{fmt(n)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                <thead><tr>
                  <th style={th}>Listing</th><th style={th}>Category</th><th style={th}>City</th>
                  <th style={th}>Price</th><th style={th}>Status</th><th style={th}>Views</th><th style={th}>Actions</th>
                </tr></thead>
                <tbody>
                  {listings.length === 0 && !loading && (
                    <tr><td style={{ ...td, textAlign: 'center', color: '#9CA3AF', padding: '40px' }} colSpan={7}>No listings yet.</td></tr>
                  )}
                  {listings.map(l => {
                    const st = l.status || 'active'
                    return (
                      <tr key={l.id}>
                        <td style={td}>
                          <div style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                          {l.is_featured && <span style={{ ...pill('#FFF7E6', '#B7791F'), marginTop: '4px', display: 'inline-block' }}>★ Featured</span>}
                        </td>
                        <td style={td}>{l.category}</td>
                        <td style={td}>{l.city}</td>
                        <td style={td}>{l.price_label}</td>
                        <td style={td}>
                          <span style={st === 'active' ? pill('#ECFDF3', '#067647') : pill('#FEF3F2', '#B42318')}>{st}</span>
                        </td>
                        <td style={td}>{fmt(l.views || 0)}</td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button disabled={busyId === l.id} onClick={() => toggleFeatured(l)} style={btn(l.is_featured ? '#6B7280' : '#FBBF24', l.is_featured ? '#fff' : '#111')}>{l.is_featured ? 'Unfeature' : 'Feature'}</button>
                            {st === 'active'
                              ? <button disabled={busyId === l.id} onClick={() => setStatus(l, 'hidden')} style={btn('#374151')}>Hide</button>
                              : <button disabled={busyId === l.id} onClick={() => setStatus(l, 'active')} style={btn(GREEN)}>Activate</button>}
                            <button disabled={busyId === l.id} onClick={() => setConfirmDelete(l)} style={btn('#FEE4E2', '#B42318')}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SELLERS */}
        {tab === 'sellers' && (
          <>
            <div style={{ ...card, padding: '12px 16px', marginBottom: '14px', fontSize: '12px', color: '#6B7280', background: '#FBFBFC' }}>
              Sellers below are derived from people who have posted listings. Full account management (ban, reset, delete) lives in your Supabase dashboard → Authentication → Users, which can't be exposed safely in the browser.
            </div>
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead><tr>
                    <th style={th}>Name</th><th style={th}>Phone</th><th style={th}>Listings</th><th style={th}>Total views</th>
                  </tr></thead>
                  <tbody>
                    {sellers.length === 0 && !loading && (
                      <tr><td style={{ ...td, textAlign: 'center', color: '#9CA3AF', padding: '40px' }} colSpan={4}>No sellers yet.</td></tr>
                    )}
                    {sellers.sort((a, b) => b.count - a.count).map(s => (
                      <tr key={s.user_id}>
                        <td style={td}>{s.name}</td>
                        <td style={td}>{s.phone}</td>
                        <td style={td}>{fmt(s.count)}</td>
                        <td style={td}>{fmt(s.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* REPORTS */}
        {tab === 'reports' && (
          <>
            <div style={{ ...card, padding: '12px 16px', marginBottom: '14px', fontSize: '12px', color: '#6B7280', background: '#FBFBFC' }}>
              Listings reported by users for review. Open the listing to inspect it, then hide or delete it from the Listings tab if needed.
            </div>
            {reports.length === 0 ? (
              <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚑</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>No reports</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>When a user reports a listing, it shows up here for review.</div>
              </div>
            ) : (
              <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                    <thead><tr>
                      <th style={th}>Date</th><th style={th}>Listing</th><th style={th}>Reason</th><th style={th}>Details</th><th style={th}>Action</th>
                    </tr></thead>
                    <tbody>
                      {reports.map((r, i) => {
                        const l = listings.find(x => x.id === r.listing_id)
                        return (
                          <tr key={r.id || i}>
                            <td style={td}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                            <td style={td}>{l ? l.title : (r.listing_id || '—')}</td>
                            <td style={td}><span style={pill('#FEF3F2', '#B42318')}>{r.reason || '—'}</span></td>
                            <td style={{ ...td, maxWidth: '260px', whiteSpace: 'normal' }}>{r.details || '—'}</td>
                            <td style={td}>
                              {l
                                ? <button onClick={() => { setTab('listings') }} style={btn('#374151')}>Review in Listings</button>
                                : <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Listing removed</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* REVENUE */}
        {tab === 'revenue' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <Stat label="Boost revenue" value={money(revenue)} sub={`${boosts.length} payments`} />
              <Stat label="Live boosts" value={fmt(boostedLive)} sub="active right now" />
              <Stat label="Featured listings" value={fmt(featured)} />
            </div>
            {boosts.length === 0 ? (
              <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>◆</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>No boost payments yet</div>
                <div style={{ fontSize: '13px', color: '#6B7280', maxWidth: '420px', margin: '0 auto' }}>
                  When sellers pay to boost listings, each payment appears here. Connect Stripe to start accepting boost payments.
                </div>
              </div>
            ) : (
              <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead><tr>
                      <th style={th}>Date</th><th style={th}>Listing</th><th style={th}>Amount</th><th style={th}>Status</th>
                    </tr></thead>
                    <tbody>
                      {boosts.map((b, i) => (
                        <tr key={b.id || i}>
                          <td style={td}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                          <td style={td}>{b.listing_id || '—'}</td>
                          <td style={td}>{money(Number(b.amount) || Number(b.amount_etb) || 0)}</td>
                          <td style={td}>{b.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ ...card, padding: '24px', maxWidth: '380px', width: '100%' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>Delete this listing?</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>{confirmDelete.title}</div>
            <div style={{ fontSize: '12px', color: '#B42318', marginBottom: '20px' }}>This permanently removes it from the database and can’t be undone.</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={btn('#F0F2F4', '#111')}>Cancel</button>
              <button disabled={busyId === confirmDelete.id} onClick={() => doDelete(confirmDelete)} style={btn('#D92D20')}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
