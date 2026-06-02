'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Comment {
    id: string
    body: string
    is_seller_reply: boolean
    created_at: string
    user_id: string
    profiles?: { full_name: string | null }
}

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
    const [listing, setListing] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [listingId, setListingId] = useState<string>('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [commentBody, setCommentBody] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [commentError, setCommentError] = useState('')

  const router = useRouter()
    const supabase = createClient()

  useEffect(() => {
        async function init() {
                const { id } = await params
                setListingId(id)

          const { data } = await supabase.from('listings').select('*').eq('id', id).single()
                setListing(data)
                setLoading(false)

          const { data: authData } = await supabase.auth.getUser()
                setCurrentUserId(authData.user?.id ?? null)

          fetchComments(id)
        }
        init()
  }, [])

  async function fetchComments(id: string) {
        setCommentsLoading(true)
        const res = await fetch(`/api/comments?listing_id=${id}`)
        const data = await res.json()
        setComments(data.comments ?? [])
        setCommentsLoading(false)
  }

  async function submitComment() {
        if (!commentBody.trim() || !currentUserId) return
        setSubmitting(true)
        setCommentError('')
        const isSellerReply = currentUserId === listing?.user_id
        const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                          listing_id: listingId,
                          body: commentBody.trim(),
                          user_id: currentUserId,
                          is_seller_reply: isSellerReply,
                }),
        })
        if (res.ok) {
                setCommentBody('')
                fetchComments(listingId)
        } else {
                const d = await res.json()
                setCommentError(d.error ?? 'Failed to post comment.')
        }
        setSubmitting(false)
  }

  function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>div>
      if (!listing) return <div style={{padding:'40px',textAlign:'center'}}>Listing not found</div>div>

      const img = listing.image_urls?.[0] || null

  return (
        <div style={{maxWidth:'600px',margin:'0 auto',paddingBottom:'60px'}}>
          {/* Hero image */}
                <div style={{position:'relative',height:'300px',background:'#111'}}>
                  {img && <img src={img} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
                          <button onClick={()=>router.back()} style={{position:'absolute',top:'16px',left:'16px',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:'36px',height:'36px',fontSize:'18px',cursor:'pointer'}}>←</button>button>
                </div>div>

                <div style={{padding:'20px'}}>
                  {/* Title + category */}
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'8px'}}>
                                      <h1 style={{fontSize:'22px',fontWeight:'800',margin:0}}>{listing.title}</h1>h1>
                                      <span style={{background:'#078754',color:'white',borderRadius:'20px',padding:'4px 12px',fontSize:'13px',fontWeight:'700'}}>{listing.category}</span>span>
                          </div>div>

                          <div style={{fontSize:'28px',fontWeight:'900',color:'#1a1a1a',marginBottom:'4px'}}>ETB {parseFloat(listing.price).toLocaleString()}</div>div>
                          <div style={{color:'#666',fontSize:'14px',marginBottom:'16px'}}>📍 {listing.neighbourhood}, {listing.city}</div>div>

                  {/* Description */}
                          <div style={{background:'#f9f9f9',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
                                      <div style={{fontWeight:'700',marginBottom:'8px'}}>Description</div>div>
                                      <div style={{color:'#444',lineHeight:1.6}}>{listing.description}</div>div>
                          </div>div>

                  {/* Contact */}
                          <div style={{background:'#f9f9f9',borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
                                      <div style={{fontWeight:'700',marginBottom:'8px'}}>Contact</div>div>
                                      <div style={{color:'#444'}}>{listing.contact_name}</div>div>
                                      <div style={{color:'#444'}}>{listing.contact_phone}</div>div>
                          </div>div>

                  {/* CTA buttons */}
                          <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'32px'}}>
                                      <a href={`https://wa.me/${listing.contact_phone?.replace(/\D/g,'')}`} target="_blank"
                                                    style={{display:'block',width:'100%',background:'#25D366',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                                                    📱 WhatsApp
                                      </a>a>
                                      <a href={`https://t.me/${listing.contact_phone?.replace(/\D/g,'')}`} target="_blank"
                                                    style={{display:'block',width:'100%',background:'#0088cc',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                                                    ✈️ Telegram
                                      </a>a>
                                      <a href={`tel:${listing.contact_phone}`}
                                                    style={{display:'block',width:'100%',background:'#078754',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                                                    📞 Call {listing.contact_phone}
                                      </a>a>
                                      <div style={{display:'flex',gap:'12px'}}>
                                                    <a href="https://facebook.com" target="_blank"
                                                                    style={{flex:1,background:'#1877F2',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none'}}>
                                                                    Facebook
                                                    </a>a>
                                                    <a href="https://instagram.com" target="_blank"
                                                                    style={{flex:1,background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',color:'white',borderRadius:'14px',padding:'16px',fontSize:'15px',fontWeight:'900',textAlign:'center',textDecoration:'none'}}>
                                                                    Instagram
                                                    </a>a>
                                      </div>div>
                          </div>div>

                  {/* ── Comments & Reviews ── */}
                          <div style={{borderTop:'2px solid #f0f0f0',paddingTop:'24px'}}>
                                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
                                                    <h2 style={{fontSize:'18px',fontWeight:'800',margin:0}}>Comments & Reviews</h2>h2>
                                                    <span style={{background:'#f0f0f0',borderRadius:'20px',padding:'2px 10px',fontSize:'13px',color:'#666'}}>
                                                      {comments.length}
                                                    </span>span>
                                      </div>div>

                            {/* Comment list */}
                            {commentsLoading ? (
                      <div style={{color:'#999',fontSize:'14px',marginBottom:'20px'}}>Loading comments...</div>div>
                    ) : comments.length === 0 ? (
                      <div style={{color:'#999',fontSize:'14px',marginBottom:'20px'}}>No comments yet. Be the first to leave a review.</div>div>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
                        {comments.map(c => (
                                        <div key={c.id} style={{
                                                            display:'flex',gap:'12px',
                                                            background: c.is_seller_reply ? '#fffbeb' : '#fafafa',
                                                            border: c.is_seller_reply ? '1px solid #fcd34d' : '1px solid #f0f0f0',
                                                            borderRadius:'12px',
                                                            padding:'14px'
                                        }}>
                                          {/* Avatar */}
                                                            <div style={{
                                                              width:'36px',height:'36px',borderRadius:'50%',
                                                              background:'#078754',color:'white',
                                                              display:'flex',alignItems:'center',justifyContent:'center',
                                                              fontWeight:'700',fontSize:'14px',flexShrink:0
                                        }}>
                                                              {c.is_seller_reply ? 'S' : (c.profiles?.full_name?.[0]?.toUpperCase() ?? '?')}
                                                            </div>div>
                                          {/* Body */}
                                                            <div style={{flex:1}}>
                                                                                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px',flexWrap:'wrap'}}>
                                                                                                          <span style={{fontWeight:'700',fontSize:'14px'}}>
                                                                                                            {c.is_seller_reply ? 'Seller' : (c.profiles?.full_name ?? 'User')}
                                                                                                            </span>span>
                                                                                    {c.is_seller_reply && (
                                                                  <span style={{background:'#f59e0b',color:'white',borderRadius:'4px',padding:'1px 6px',fontSize:'11px',fontWeight:'700'}}>
                                                                                              SELLER
                                                                  </span>span>
                                                                )}
                                                                                                          <span style={{color:'#999',fontSize:'12px',marginLeft:'auto'}}>{formatDate(c.created_at)}</span>span>
                                                                                    </div>div>
                                                                                  <p style={{margin:0,fontSize:'14px',color:'#444',lineHeight:1.5}}>{c.body}</p>p>
                                                            </div>div>
                                        </div>div>
                                      ))}
                      </div>div>
                    )}

                            {/* Post comment form */}
                            {currentUserId ? (
                      <div style={{borderTop:'1px solid #f0f0f0',paddingTop:'16px'}}>
                                      <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'8px',color:'#333'}}>
                                        {currentUserId === listing?.user_id ? 'Reply as Seller' : 'Leave a Comment'}
                                      </div>div>
                                      <textarea
                                                        value={commentBody}
                                                        onChange={e => setCommentBody(e.target.value)}
                                                        placeholder="Share your experience or ask a question..."
                                                        maxLength={500}
                                                        rows={3}
                                                        style={{width:'100%',borderRadius:'12px',border:'1px solid #ddd',padding:'12px',fontSize:'14px',resize:'none',boxSizing:'border-box',fontFamily:'inherit'}}
                                                      />
                                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px'}}>
                                                        <span style={{fontSize:'12px',color:'#999'}}>{commentBody.length}/500</span>span>
                                        {commentError && <span style={{fontSize:'12px',color:'#ef4444'}}>{commentError}</span>span>}
                                                        <button
                                                                            onClick={submitComment}
                                                                            disabled={submitting || !commentBody.trim()}
                                                                            style={{background:'#078754',color:'white',border:'none',borderRadius:'10px',padding:'10px 20px',fontSize:'14px',fontWeight:'700',cursor:'pointer',opacity:submitting||!commentBody.trim()?0.5:1}}>
                                                          {submitting ? 'Posting...' : 'Post Comment'}
                                                        </button>button>
                                      </div>div>
                      </div>div>
                    ) : (
                      <div style={{borderTop:'1px solid #f0f0f0',paddingTop:'16px',fontSize:'14px',color:'#666'}}>
                                      <a href="/auth/login" style={{color:'#078754',fontWeight:'700',textDecoration:'none'}}>Sign in</a>a> to leave a comment or review.
                      </div>div>
                    )}
                          </div>div>
                </div>div>
        </div>div>
      )
}
