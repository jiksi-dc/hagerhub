'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const CITIES = ['Addis Ababa','Dire Dawa','Hawassa','Bahir Dar','Mekelle','Adama','Gondar','Jimma','Dessie','Jijiga']

const VEHICLE_MAKES = ['Audi','BMW','BYD','Changan','Chery','Chevrolet','Citroën','Daihatsu','Dongfeng','Fiat','Ford','Foton','Geely','Great Wall','Haval','Hino','Honda','Hyundai','Isuzu','JAC','Jeep','Kia','Land Rover','Lexus','Mazda','Mercedes','MG','Mitsubishi','Nissan','Opel','Peugeot','Renault','Scania','Škoda','Subaru','Suzuki','Tata','Tesla','Toyota','Volkswagen','Volvo','Other']

const SUBCATEGORIES: Record<string, string[]> = {
Discover: ['Tourist Attraction','National Park','Nature & Wildlife','Museum & Heritage','Religious Site','Festival & Cultural Event','Concert & Entertainment','Sports Event','Food & Dining Experience','Market & Shopping','Tour Package','Other Experience'],
  Properties: ['Residential for Rent','Residential for Sale','Commercial for Rent','Commercial for Sale','Land & Plots'],
  Vehicles: ['Cars','Trucks & LGVs','Motorcycles','Auto Parts & Accessories','Heavy Vehicles'],
  Machinery: ['Farm Equipment','Construction Machinery','Generators','Industrial Equipment','Other Machinery'],
  Classifieds: ['Mobile Phones','Electronics','Furniture & Home','Clothing & Accessories','Sports Equipment','Other'],
  Jobs: ['Accounting & Finance','Engineering','IT & Technology','Healthcare','Education','Sales & Marketing','Other'],
}

const AMENITIES = ['24-hour Electricity','Water Tank','Air Conditioning','Balcony','Parking Space','Kitchen Cabinets','Furnished','Elevator','Security/Guard','Backup Generator','Garden','Internet/WiFi']
const CAR_FEATURES = ['Air Conditioning','Cruise Control','Sunroof','Leather Seats','Navigation/GPS','Backup Camera','Bluetooth','Power Windows','Power Steering','Alloy Wheels','Keyless Entry','Parking Sensors','Heated Seats','ABS Brakes','Airbags']

const inp = {border:'1px solid #E5E7EB',borderRadius:'10px',padding:'12px 16px',fontSize:'14px',width:'100%',outline:'none',fontFamily:'inherit',color:'#111',background:'#fff'}
const lbl = {fontSize:'13px',fontWeight:700,color:'#374151',marginBottom:'6px',display:'block'}
const sel = {...inp,cursor:'pointer'}

const ToggleGroup = ({label, options, value, onChange}: {label:string, options:string[], value:string, onChange:(v:string)=>void}) => (
  <div style={{marginBottom:'20px'}}>
    <label style={lbl as any}>{label}</label>
    <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
      {options.map(o => (
        <button key={o} onClick={()=>onChange(o)} style={{padding:'8px 16px',borderRadius:'8px',border:`1.5px solid ${value===o?'#111':'#E5E7EB'}`,background:value===o?'#111':'#fff',color:value===o?'#fff':'#374151',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          {o}
        </button>
      ))}
    </div>
  </div>
)

const Field = ({label, value, onChange, placeholder, type='text', suffix=''}: any) => (
  <div style={{marginBottom:'20px'}}>
    <label style={lbl as any}>{label}</label>
    <div style={{position:'relative'}}>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inp, paddingRight: suffix ? '60px' : '16px'}}/>
      {suffix && <span style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',fontSize:'13px',color:'#9CA3AF',fontWeight:600}}>{suffix}</span>}
    </div>
  </div>
)

const Select = ({label, value, onChange, options}: any) => (
  <div style={{marginBottom:'20px'}}>
    <label style={lbl as any}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={sel as any}>
      <option value="">Select...</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

export default function PostAd() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [cat, setCat] = useState('')
  const [subcat, setSubcat] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [postedId, setPostedId] = useState<string|null>(null)
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  // Common fields
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
const [currency, setCurrency] = useState<'ETB'|'USD'>('ETB')
  const [phone, setPhone] = useState('')
  const [desc, setDesc] = useState('')
  const [city, setCity] = useState('Addis Ababa')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [address, setAddress] = useState('')

  // Vehicle fields
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [km, setKm] = useState('')
  const [fuel, setFuel] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [bodyCondition, setBodyCondition] = useState('')
  const [mechCondition, setMechCondition] = useState('')
  const [sellerType, setSellerType] = useState('')
  const [transmission, setTransmission] = useState('')

  // Property fields
  const [purpose, setPurpose] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [area, setArea] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])

  // Job fields
  const [company, setCompany] = useState('')
  const [empType, setEmpType] = useState('')
  const [salary, setSalary] = useState('')

  // Machinery fields
  const [condition, setCondition] = useState('')
  const [capacity, setCapacity] = useState('')

  // Discover fields
  const [eventDate, setEventDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [venue, setVenue] = useState('')
  const [website, setWebsite] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [region, setRegion] = useState('')
  const [admission, setAdmission] = useState('Free')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      if (editId) {
        const { data: l } = await supabase.from('listings').select('*').eq('id', editId).single()
        if (l && l.user_id === data.user.id) {
          setCat(l.category||''); setSubcat(l.subcategory||'')
          setTitle(l.title||''); setPrice(l.price_amount?String(l.price_amount):''); setCurrency((l.price_currency==='USD'?'USD':'ETB'))
          setPhone(l.contact_phone||''); setDesc(l.description||''); setCity(l.city||'Addis Ababa')
          setNeighbourhood(l.neighbourhood||''); setAddress(l.address||'')
          setMake(l.make||''); setModel(l.model||''); setYear(l.year||''); setKm(l.mileage||'')
          setFuel(l.fuel_type||''); setBodyType(l.body_type||''); setBodyCondition(l.body_condition||'')
          setMechCondition(l.mechanical_condition||''); setSellerType(l.seller_type||''); setTransmission(l.transmission||'')
          setPurpose(l.purpose||''); setBedrooms(l.bedrooms||''); setBathrooms(l.bathrooms||''); setArea(l.area_sqm||''); setAmenities(l.amenities||[])
          setCompany(l.company||''); setEmpType(l.employment_type||''); setSalary(l.salary||'')
          setCondition(l.condition||''); setCapacity(l.capacity||'')
          setEventDate(l.event_date||''); setEventEndDate(l.event_end_date||''); setEventTime(l.event_time||'')
          setVenue(l.venue||''); setWebsite(l.website||''); setOrganizer(l.organizer||''); setRegion(l.region||'')
          setAdmission(l.admission_fee||'Free')
          setExistingImages(l.image_urls||[])
          setStep(3)
        }
      }
    })
  }, [editId])

  const years = Array.from({length: 35}, (_, i) => (2025 - i).toString())


  async function handleSubmit() {
    if (!title || !price || !phone || !desc) { setError('Please fill in all required fields.'); return }
    setLoading(true); setError(''); setStatus('🤖 AI is reviewing your listing...')
    try {
      const modRes = await fetch('/api/moderate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, description: desc, category: cat, price}) })
      const mod = await modRes.json()
      if (!mod.approved) { setError('Listing rejected: ' + mod.reason); setLoading(false); setStatus(''); return }

      setStatus('✅ Approved! Uploading photos...')
      let image_urls: string[] = []
      for (const photo of photos) {
        const fd = new FormData(); fd.append('file', photo)
        const res = await fetch('/api/upload', { method:'POST', body: fd })
        const json = await res.json()
        if (json.url) image_urls.push(json.url)
        else console.error('Upload failed:', json.error)
      }

      setStatus('💾 Saving your listing...')
      const supabase = createClient()
      const finalImages = image_urls.length ? image_urls : existingImages
      const row: any = {
        title, description: desc, price_label: `${currency} ${Number(price).toLocaleString()}`,
        price_amount: Number(price), price_currency: currency,
        category: cat, subcategory: subcat, city, neighbourhood, address,
        image_urls: finalImages,
        make, model, year, mileage: km, fuel_type: fuel, body_type: bodyType,
        body_condition: bodyCondition, mechanical_condition: mechCondition,
        seller_type: sellerType, transmission,
        purpose, bedrooms, bathrooms, area_sqm: area,
        company, employment_type: empType, salary,
        condition, capacity, amenities,
        event_date: eventDate || null, event_end_date: eventEndDate || null, event_time: eventTime || null,
        venue, website, organizer, region, admission_fee: admission,
        contact_phone: phone,
      }
      if (editId) {
        const { error: dbErr } = await supabase.from('listings').update(row).eq('id', editId)
        if (dbErr) { setError('Failed to save: ' + dbErr.message); setLoading(false); setStatus(''); return }
        setPostedId(editId)
        setStatus('🎉 Listing updated!')
      } else {
        const { data: newListing, error: dbErr } = await supabase.from('listings').insert({ ...row, status: 'active', user_id: user?.id }).select('id').single()
        if (dbErr) { setError('Failed to save: ' + dbErr.message); setLoading(false); setStatus(''); return }
        setPostedId(newListing?.id || null)
        setStatus('🎉 Your listing is live!')
      }
    } catch (e: any) { setError(e.message || 'Something went wrong'); setLoading(false); setStatus('') }
  }

  if (!user) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'16px',color:'#9CA3AF'}}>Loading...</div>

  const CATS = ['Properties','Vehicles','Machinery','Classifieds','Jobs','Discover Ethiopia']

  return (
    <main style={{fontFamily:'system-ui,-apple-system,sans-serif',background:'#F7F7F7',minHeight:'100vh'}}>
      <header style={{background:'#fff',borderBottom:'1px solid #EBEBEB',padding:'14px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
        <a href="/" style={{fontSize:'18px',fontWeight:900,color:'#111',letterSpacing:'2px',textDecoration:'none'}}>ETHIOFY</a>
        <div style={{width:'1px',height:'20px',background:'#E5E7EB'}}></div>
        <span style={{fontSize:'15px',fontWeight:700,color:'#374151'}}>{editId ? 'Edit listing' : 'Post your ad — FREE'}</span>
      </header>

      <div style={{maxWidth:'640px',margin:'32px auto',padding:'0 20px'}}>

        {postedId && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'40px 32px',border:'1px solid #EBEBEB',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>🎉</div>
            <div style={{fontSize:'22px',fontWeight:900,color:'#111',marginBottom:'6px'}}>{editId ? 'Listing updated!' : 'Your listing is live!'}</div>
            <div style={{fontSize:'14px',color:'#9CA3AF',marginBottom:'28px'}}>Want more buyers? Boost it to the top of the category.</div>
            <a href={`/boost?listing_id=${postedId}`} style={{display:'block',width:'100%',padding:'15px',background:'#111',color:'white',borderRadius:'12px',fontSize:'15px',fontWeight:800,textDecoration:'none',marginBottom:'12px'}}>⚡ Boost this listing</a>
            <a href={`/listing/${postedId}`} style={{display:'block',width:'100%',padding:'13px',background:'#F9FAFB',color:'#374151',border:'1.5px solid #E5E7EB',borderRadius:'12px',fontSize:'14px',fontWeight:600,textDecoration:'none'}}>View my listing</a>
          </div>
        )}

        {/* STEP 1 — Choose Category */}
        {!postedId && step === 1 && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',border:'1px solid #EBEBEB'}}>
            <div style={{textAlign:'center',marginBottom:'28px'}}>
              <div style={{fontSize:'22px',fontWeight:900,color:'#111',marginBottom:'6px'}}>Choose a category</div>
              <div style={{fontSize:'14px',color:'#9CA3AF'}}>Select the category that best describes what you are selling</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {CATS.map(c => (
                <button key={c} onClick={()=>{setCat(c);setStep(2)}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',border:'1px solid #EBEBEB',borderRadius:'12px',background:'#fff',cursor:'pointer',fontSize:'15px',fontWeight:600,color:'#111',fontFamily:'inherit',textAlign:'left'}}>
                  <span>{c === 'Discover Ethiopia' ? '🇪🇹 Discover Ethiopia' : c}</span>
                  <span style={{color:'#9CA3AF',fontSize:'18px'}}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Choose Subcategory */}
        {!postedId && step === 2 && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',border:'1px solid #EBEBEB'}}>
            <button onClick={()=>setStep(1)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#6B7280',marginBottom:'20px',fontFamily:'inherit',padding:0}}>← Back</button>
            <div style={{textAlign:'center',marginBottom:'28px'}}>
              <div style={{fontSize:'22px',fontWeight:900,color:'#111',marginBottom:'6px'}}>Choose a subcategory</div>
              <div style={{fontSize:'13px',color:'#9CA3AF',letterSpacing:'0.5px'}}>{cat} › Select type</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {(SUBCATEGORIES[cat] || []).map(s => (
                <button key={s} onClick={()=>{setSubcat(s);setStep(3)}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',border:'1px solid #EBEBEB',borderRadius:'12px',background:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:600,color:'#111',fontFamily:'inherit',textAlign:'left'}}>
                  {s}<span style={{color:'#9CA3AF',fontSize:'18px'}}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Fill Form */}
        {!postedId && step === 3 && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'32px',border:'1px solid #EBEBEB'}}>
            <button onClick={()=>setStep(2)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#6B7280',marginBottom:'20px',fontFamily:'inherit',padding:0}}>← Back</button>
            <div style={{marginBottom:'28px'}}>
              <div style={{fontSize:'22px',fontWeight:900,color:'#111',marginBottom:'4px'}}>You're almost there!</div>
              <div style={{fontSize:'13px',color:'#9CA3AF'}}>{cat} › {subcat} · Include as many details and photos as possible</div>
            </div>

            {/* PHOTOS */}
            <div style={{marginBottom:'24px'}}>
              <label style={lbl as any}>Photos <span style={{color:'#9CA3AF',fontWeight:400}}>(up to 10)</span></label>
              <label style={{display:'block',border:'2px dashed #E5E7EB',borderRadius:'12px',padding:'24px',textAlign:'center',cursor:'pointer',background:'#FAFAFA'}}>
                <input type="file" accept="image/*,.heic,.heif" multiple style={{display:'none'}} onChange={e=>setPhotos(Array.from(e.target.files||[]))}/>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:'8px'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <div style={{fontSize:'14px',fontWeight:700,color:'#374151',marginBottom:'4px'}}>Tap to add photos</div>
                <div style={{fontSize:'12px',color:'#9CA3AF'}}>JPG, PNG, HEIC (iPhone) · Up to 10 photos</div>
              </label>
              {photos.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'12px'}}>
                  {photos.map((p,i) => (
                    <div key={i} style={{position:'relative'}}>
                      <img src={URL.createObjectURL(p)} alt="preview" style={{width:'72px',height:'72px',borderRadius:'8px',objectFit:'cover',border:'2px solid #EBEBEB'}}/>
                      <button onClick={()=>setPhotos(photos.filter((_,j)=>j!==i))} style={{position:'absolute',top:'-6px',right:'-6px',background:'#EF4444',color:'white',border:'none',borderRadius:'50%',width:'20px',height:'20px',fontSize:'12px',cursor:'pointer'}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Title *" value={title} onChange={setTitle} placeholder={
              cat === 'Properties' ? 'e.g. 3BR Apartment for Rent in Bole' :
              cat === 'Vehicles' ? 'e.g. 2020 Toyota Land Cruiser VX' :
              cat === 'Jobs' ? 'e.g. Senior Software Engineer' :
              cat === 'Machinery' ? 'e.g. Caterpillar 320D Excavator' :
              'e.g. iPhone 15 Pro Max 256GB'
            }/>
            <div style={{marginBottom:'20px'}}>
<label style={lbl as any}>Price *</label>
<div style={{display:'flex',gap:'8px'}}>
<div style={{display:'flex',border:'1px solid #E5E7EB',borderRadius:'10px',overflow:'hidden',flexShrink:0}}>
<button onClick={()=>setCurrency('ETB')} style={{padding:'12px 14px',background:currency==='ETB'?'#111':'#fff',color:currency==='ETB'?'white':'#374151',border:'none',cursor:'pointer',fontWeight:700,fontSize:'13px',fontFamily:'inherit'}}>ETB</button>
<button onClick={()=>setCurrency('USD')} style={{padding:'12px 14px',background:currency==='USD'?'#111':'#fff',color:currency==='USD'?'white':'#374151',border:'none',cursor:'pointer',fontWeight:700,fontSize:'13px',fontFamily:'inherit'}}>USD</button>
</div>
<input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" style={{...inp,flex:1}}/>
</div>
{currency==='USD' && price && <div style={{fontSize:'12px',color:'#6B7280',marginTop:'6px'}}>≈ ETB {(Number(price)*57).toLocaleString()} at current rate</div>}
</div>
            <Field label="Phone number *" value={phone} onChange={setPhone} placeholder="+251 9XX XXX XXX"/>

            {/* VEHICLE FIELDS */}
            {cat === 'Vehicles' && (<>
              <Select label="Make *" value={make} onChange={setMake} options={VEHICLE_MAKES}/>
              <Field label="Model *" value={model} onChange={setModel} placeholder="e.g. Land Cruiser"/>
              <Select label="Year *" value={year} onChange={setYear} options={years}/>
              <Field label="Kilometers *" value={km} onChange={setKm} placeholder="0" type="number" suffix="km"/>
              <ToggleGroup label="Fuel Type *" options={['Petrol','Diesel','Hybrid','Electric']} value={fuel} onChange={setFuel}/>
              <ToggleGroup label="Transmission *" options={['Automatic','Manual']} value={transmission} onChange={setTransmission}/>
              <Select label="Body Type *" value={bodyType} onChange={setBodyType} options={['Sedan','SUV','Pickup','Van','Minibus','Coupe','Hatchback','Other']}/>
              <Select label="Body Condition *" value={bodyCondition} onChange={setBodyCondition} options={['Excellent','Good','Fair','Needs Repair']}/>
              <Select label="Mechanical Condition *" value={mechCondition} onChange={setMechCondition} options={['Excellent','Good','Fair','Needs Repair']}/>
              <ToggleGroup label="Seller Type *" options={['Private','Dealer','Broker']} value={sellerType} onChange={setSellerType}/>
              <div style={{marginBottom:'20px'}}>
                <label style={lbl as any}>Features <span style={{color:'#9CA3AF',fontWeight:400}}>(tap all that apply)</span></label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {CAR_FEATURES.map(a => {
                    const on = amenities.includes(a)
                    return (
                      <button key={a} type="button" onClick={()=>setAmenities(on?amenities.filter(x=>x!==a):[...amenities,a])}
                        style={{padding:'8px 14px',borderRadius:'8px',border:`1.5px solid ${on?'#111':'#E5E7EB'}`,background:on?'#111':'#fff',color:on?'#fff':'#374151',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                        {on?'✓ ':''}{a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>)}

            {/* PROPERTY FIELDS */}
            {cat === 'Properties' && (<>
              <ToggleGroup label="Purpose *" options={['For Rent','For Sale']} value={purpose} onChange={setPurpose}/>
              <Select label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={['Studio','1','2','3','4','5','6+']}/>
              <Select label="Bathrooms" value={bathrooms} onChange={setBathrooms} options={['1','2','3','4','5+']}/>
              <Field label="Area" value={area} onChange={setArea} placeholder="0" type="number" suffix="m²"/>
              <Field label="Neighbourhood" value={neighbourhood} onChange={setNeighbourhood} placeholder="e.g. Bole, CMC, Kazanchis"/>
              <div style={{marginBottom:'20px'}}>
                <label style={lbl as any}>Amenities <span style={{color:'#9CA3AF',fontWeight:400}}>(tap all that apply)</span></label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {AMENITIES.map(a => {
                    const on = amenities.includes(a)
                    return (
                      <button key={a} type="button" onClick={()=>setAmenities(on?amenities.filter(x=>x!==a):[...amenities,a])}
                        style={{padding:'8px 14px',borderRadius:'8px',border:`1.5px solid ${on?'#111':'#E5E7EB'}`,background:on?'#111':'#fff',color:on?'#fff':'#374151',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                        {on?'✓ ':''}{a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>)}

            {/* JOBS FIELDS */}
            {cat === 'Jobs' && (<>
              <Field label="Company Name" value={company} onChange={setCompany} placeholder="Company or Organization"/>
              <ToggleGroup label="Employment Type *" options={['Full-time','Part-time','Contract','Remote']} value={empType} onChange={setEmpType}/>
              <Field label="Salary (ETB/month)" value={salary} onChange={setSalary} placeholder="0" type="number" suffix="ETB"/>
            </>)}

            {/* MACHINERY FIELDS */}
            {cat === 'Machinery' && (<>
              <Field label="Brand / Make" value={make} onChange={setMake} placeholder="e.g. Caterpillar, John Deere"/>
              <Field label="Model" value={model} onChange={setModel} placeholder="e.g. 320D"/>
              <Select label="Year" value={year} onChange={setYear} options={years}/>
              <ToggleGroup label="Condition *" options={['New','Used','Refurbished']} value={condition} onChange={setCondition}/>
              <Field label="Capacity / Weight" value={capacity} onChange={setCapacity} placeholder="e.g. 5 tons, 50KVA"/>
            </>)}

            {/* CLASSIFIEDS FIELDS */}
            {cat === 'Classifieds' && (
              <ToggleGroup label="Condition *" options={['New','Like New','Used','For Parts']} value={condition} onChange={setCondition}/>
            )}

            <div style={{marginBottom:'20px'}}>
              <label style={lbl as any}>Description *</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe your item in detail..." rows={5} style={{...inp, resize:'vertical'} as any}/>
              <div style={{fontSize:'11px',color:'#9CA3AF',textAlign:'right',marginTop:'4px'}}>{desc.length}/16000</div>
            </div>

            <div style={{marginBottom:'20px',padding:'16px',border:'1px solid #E5E7EB',borderRadius:'10px',background:'#FAFAFA'}}>
              <div style={{fontSize:'14px',fontWeight:700,color:'#374151',marginBottom:'4px'}}>📍 Show location on a map?</div>
              <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'10px'}}>Optional — add an address and buyers get a "View on map" link. Leave blank to skip.</div>
              <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. Bole Road, near Edna Mall, Addis Ababa" style={inp as any}/>
            </div>

            <Select label="City *" value={city} onChange={setCity} options={CITIES}/>

            {error && <div style={{background:'#FFF0F0',border:'1px solid #FECACA',borderRadius:'10px',padding:'12px',marginBottom:'16px',color:'#CC0000',fontSize:'13px'}}>❌ {error}</div>}
            {status && <div style={{background:'#F0FFF4',border:'1px solid #BBF7D0',borderRadius:'10px',padding:'12px',marginBottom:'16px',color:'#166534',fontSize:'13px'}}>{status}</div>}

            <div style={{fontSize:'12px',color:'#9CA3AF',marginBottom:'16px',lineHeight:1.5}}>
              By posting, I confirm the information is complete and accurate. <a href="/terms" style={{color:'#2563EB'}}>Terms & conditions</a>.
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{width:'100%',background:loading?'#9CA3AF':'#111',color:'white',border:'none',borderRadius:'12px',padding:'16px',fontSize:'16px',fontWeight:900,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit'}}>
              {loading ? status || 'Processing...' : editId ? 'Save changes' : 'Post your ad — FREE'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
