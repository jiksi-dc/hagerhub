'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'
import AIAssistant from '@/components/AIAssistant'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// Admin email — change this to your actual admin email
const ADMIN_EMAIL = 'jiksi.dc@gmail.com'

interface Listing {
  id: string; title: string; price_label: string; city: string; category: string
  subcategory: string; status: string; created_at: string; user_id: string
  image_urls?: string[]; description: string
}
interface User { id: string; email: string; created_at: string; full_name?: string }
interface Report {
  id: string; listing_id: string; reason: string; details: string
  created_at: string; reporter_id: string
  listings?: { title: string; city: string }
}

const TAB = (active: boolean) => ({
  padding: '10px 22px', fontSize: '13px', fontWeight: active ? 700 : 400,
  color: active ? '#111' : '#6B7280', background: 'none', border: 'none',
  borderBottom: active ? '2px solid #111' : '2px solid transparent',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const
})

const badge = (color: string, bg: string, text: string) => (
  <span style={{background:bg,color,fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px'}}>{text}</span>
)

export default function AdminDashboard() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'listings'|'users'|'reports'>('listings')

  const [listings, setListings] = useState<Listing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadData = async () => {
    const supabase = createClient()
    const [{ data: l }, { data: r }] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*, listings(title, city)').order('created_at', { ascending: false })
    ])
    setListings(l || [])
    setReports(r || [])
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.push(`/${locale}`)
        return
      }
      setAuthorized(true)
      await loadData()
      setLoading(false)
    })
  }, [])

  const deleteListing = async (id: string) => {
    if (!confirm('Permanently delete this listing?')) return
    const supabase = createClient()
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) { alert('Delete failed: ' + error.message); return }
    await loadData()
  }

  const setStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('listings').update({ status }).eq('id', id)
    if (error) { alert('Update failed: ' + error.message); return }
    await loadData()
  }

  const dismissReport = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) { alert('Dismiss failed: ' + error.message); return }
    await loadData()
  }

  const filteredListings = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter && l.category !== catFilter) return false
    if (statusFilter && l.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    sold: listings.filter(l => l.status === 'sold').length,
    reports: reports.length,
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif',color:'#9CA3AF'}}>
      {authorized ? 'Loading admin dashboard...' : 'Checking access...'}
    </div>
  )

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,background:'#111',borderBottom:'1px solid #222'}}>
        <div style={{maxWidth:'1400px',margin:'0 auto',padding:'0 20px',height:'52px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'14px',fontWeight:900,color:'#fff',letterSpacing:'2px'}}>GOHBAY</div>
          </a>
          <span style={{background:'#DC2626',color:'white',fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'4px',letterSpacing:'1px'}}>ADMIN</span>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <LanguageSwitcher/>
            <AIAssistant/>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'1400px',margin:'0 auto',padding:'28px 20px'}}>

        {/* STATS ROW */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
          {[
            {label:'Total Listings',value:stats.total,color:'#2563EB',bg:'#EFF6FF'},
            {label:'Active',value:stats.active,color:'#059669',bg:'#ECFDF5'},
            {label:'Sold',value:stats.sold,color:'#6B7280',bg:'#F9FAFB'},
            {label:'Open Reports',value:stats.reports,color:'#DC2626',bg:'#FEF2F2'},
          ].map(s => (
            <div key={s.label} style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',padding:'20px'}}>
              <div style={{fontSize:'28px',fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:'12px',color:'#9CA3AF',marginTop:'4px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',marginBottom:'20px',display:'flex'}}>
          {(['listings','reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={TAB(tab === t)}>
              {t === 'listings' ? `Listings (${listings.length})` : `Reports (${reports.length})`}
            </button>
          ))}
        </div>

        {/* LISTINGS TAB */}
        {tab === 'listings' && (
          <div>
            {/* Filters */}
            <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap'}}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or city..."
                style={{padding:'9px 14px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',outline:'none',flex:1,minWidth:'200px'}}
              />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                style={{padding:'9px 12px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',outline:'none',background:'#fff'}}>
                <option value="">All categories</option>
                {['Properties','Vehicles','Machinery','Classifieds','Jobs'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{padding:'9px 12px',border:'1.5px solid #E5E7EB',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',outline:'none',background:'#fff'}}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'12px'}}>{filteredListings.length} listings</div>

            {/* Table */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #F3F4F6',background:'#FAFAFA'}}>
                      {['Title','Category','City','Price','Status','Posted','Actions'].map(h => (
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(l => (
                      <tr key={l.id} style={{borderBottom:'1px solid #F9FAFB'}}>
                        <td style={{padding:'12px 16px',maxWidth:'240px'}}>
                          <a href={`/${locale}/listing/${l.id}`} target="_blank" rel="noopener noreferrer"
                            style={{color:'#111',fontWeight:600,textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}
                            title={l.title}>{l.title}</a>
                        </td>
                        <td style={{padding:'12px 16px',whiteSpace:'nowrap'}}>
                          <span style={{fontSize:'11px',background:'#F3F4F6',padding:'2px 8px',borderRadius:'20px',color:'#374151'}}>{l.subcategory || l.category}</span>
                        </td>
                        <td style={{padding:'12px 16px',color:'#6B7280',whiteSpace:'nowrap'}}>{l.city}</td>
                        <td style={{padding:'12px 16px',fontWeight:600,whiteSpace:'nowrap'}}>{l.price_label}</td>
                        <td style={{padding:'12px 16px'}}>
                          {l.status === 'active' ? badge('#059669','#ECFDF5','Active') :
                           l.status === 'sold' ? badge('#6B7280','#F3F4F6','Sold') :
                           badge('#D97706','#FFFBEB',l.status)}
                        </td>
                        <td style={{padding:'12px 16px',color:'#9CA3AF',whiteSpace:'nowrap'}}>{new Date(l.created_at).toLocaleDateString()}</td>
                        <td style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:'6px'}}>
                            <a href={`/${locale}/listing/${l.id}`} target="_blank" rel="noopener noreferrer"
                              style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',border:'1px solid #E5E7EB',color:'#374151',textDecoration:'none',whiteSpace:'nowrap'}}>
                              View
                            </a>
                            {l.status !== 'active' && (
                              <button onClick={() => setStatus(l.id, 'active')}
                                style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',border:'1px solid #D1FAE5',background:'#ECFDF5',color:'#059669',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                                Activate
                              </button>
                            )}
                            <button onClick={() => deleteListing(l.id)}
                              style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',border:'1px solid #FEE2E2',background:'#FEF2F2',color:'#DC2626',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === 'reports' && (
          <div>
            {reports.length === 0 ? (
              <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #F3F4F6',padding:'60px',textAlign:'center',color:'#9CA3AF',fontSize:'14px'}}>
                No open reports.
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {reports.map(r => (
                  <div key={r.id} style={{background:'#fff',borderRadius:'12px',border:'1px solid #F3F4F6',padding:'20px',display:'flex',alignItems:'flex-start',gap:'16px'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        <span style={{background:'#FEE2E2',color:'#DC2626',fontSize:'11px',fontWeight:700,padding:'2px 10px',borderRadius:'20px'}}>{r.reason}</span>
                        <span style={{fontSize:'11px',color:'#9CA3AF'}}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.listings && (
                        <div style={{fontSize:'13px',fontWeight:600,color:'#111',marginBottom:'4px'}}>
                          Listing: <a href={`/${locale}/listing/${r.listing_id}`} target="_blank" rel="noopener noreferrer" style={{color:'#2563EB',textDecoration:'none'}}>{r.listings.title}</a>
                          <span style={{color:'#9CA3AF',fontWeight:400}}> · {r.listings.city}</span>
                        </div>
                      )}
                      {r.details && <div style={{fontSize:'12px',color:'#6B7280',marginTop:'4px'}}>{r.details}</div>}
                    </div>
                    <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                      <button onClick={() => deleteListing(r.listing_id)}
                        style={{fontSize:'12px',padding:'6px 14px',borderRadius:'8px',border:'1px solid #FEE2E2',background:'#FEF2F2',color:'#DC2626',cursor:'pointer',fontFamily:'inherit'}}>
                        Delete listing
                      </button>
                      <button onClick={() => dismissReport(r.id)}
                        style={{fontSize:'12px',padding:'6px 14px',borderRadius:'8px',border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',fontFamily:'inherit'}}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
