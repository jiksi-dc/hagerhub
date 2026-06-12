'use client'
import { useParams } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AuthButton from '@/components/AuthButton'

export default function TermsPage() {
  const params = useParams()
  const locale = params.locale as string

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using HagerHub ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform. HagerHub is a United States-based online marketplace platform connecting buyers and sellers across Ethiopia. HagerHub is operated from the United States and is not registered as a business entity in Ethiopia.'
    },
    {
      title: '2. Eligibility',
      content: 'You must be at least 18 years of age to use HagerHub. By using the Platform, you represent and warrant that you have the legal capacity to enter into a binding agreement. HagerHub reserves the right to refuse service to anyone at any time.'
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify HagerHub immediately of any unauthorized use of your account. HagerHub is not liable for any loss resulting from unauthorized access to your account.'
    },
    {
      title: '4. Listing Rules',
      content: 'All listings must be accurate, legal, and comply with applicable United States and Ethiopian law. You may not list: stolen goods, counterfeit items, prohibited weapons, illegal substances, or any item banned under applicable law. Users are solely responsible for ensuring their listings comply with local Ethiopian laws and regulations. HagerHub reserves the right to remove any listing at its sole discretion without notice.'
    },
    {
      title: '5. Prohibited Conduct',
      content: 'You agree not to: post false or misleading information, harass or threaten other users, attempt to defraud buyers or sellers, scrape or copy content from the Platform, use automated tools to access the Platform, or interfere with the Platform\'s security or operations.'
    },
    {
      title: '6. Transactions',
      content: 'HagerHub is a listing platform only. We are not a party to any transaction between buyers and sellers. All transactions are solely between users. HagerHub does not guarantee the quality, safety, or legality of items listed, the truth of listings, or that buyers or sellers will complete transactions.'
    },
    {
      title: '7. Safety',
      content: 'We strongly recommend meeting in public places for exchanges. Never send payment before inspecting an item. Be cautious of deals that seem too good to be true. HagerHub is not responsible for any loss, harm, or injury arising from transactions made through the Platform.'
    },
    {
      title: '8. Intellectual Property',
      content: 'All content on HagerHub including logos, design, and software is the property of HagerHub and protected by applicable intellectual property laws. User-generated content remains the property of users, but by posting you grant HagerHub a non-exclusive, royalty-free license to display and distribute that content on the Platform.'
    },
    {
      title: '9. Privacy',
      content: 'Your use of HagerHub is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.'
    },
    {
      title: '10. Limitation of Liability',
      content: 'To the maximum extent permitted by applicable United States federal and state law, HagerHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability to you shall not exceed the amount you paid to use the Platform in the past 12 months. HagerHub makes no representations that the Platform is appropriate or available under Ethiopian law, and users access the Platform at their own risk and initiative.'
    },
    {
      title: '11. Governing Law & US Operations',
      content: 'HagerHub is owned and operated by a United States-based company. These Terms are governed by the laws of the United States and the State of Washington. HagerHub is not registered in Ethiopia and does not constitute a local business under Ethiopian law. Users in Ethiopia access the Platform on the basis that they accept these international terms of service.'
    },
    {
      title: '12. Dispute Resolution',
      content: 'Any disputes arising from use of HagerHub shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be subject to the exclusive jurisdiction of the courts of the State of Washington, United States, and governed by the laws of the State of Washington, without regard to conflict of law principles.'
    },
    {
      title: '13. Changes to Terms',
      content: 'HagerHub reserves the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify users of material changes via email or a prominent notice on the Platform.'
    },
    {
      title: '14. Contact',
      content: 'If you have questions about these Terms, please contact us at support@hagerhub.com or through the Help Center on the Platform.'
    },
  ]

  return (
    <main style={{minHeight:'100vh',background:'#F9FAFB',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <style>{'*{box-sizing:border-box;margin:0;padding:0}'}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #EBEBEB'}}>
        <div className="gb-navbar" style={{maxWidth:'1280px',margin:'0 auto',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',gap:'12px'}}>
          <a href={`/${locale}`} style={{textDecoration:'none',flexShrink:0}}>
            <div style={{fontSize:'15px',fontWeight:900,color:'#111',letterSpacing:'2px'}}>HAGERHUB</div>
            <div style={{fontSize:'8px',color:'#9CA3AF',letterSpacing:'1.5px',marginTop:'1px'}}>ETHIOPIA'S #1 MARKETPLACE</div>
          </a>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'}}>
            <AuthButton/>
            <a href={`/${locale}/post`} style={{fontSize:'13px',fontWeight:600,padding:'9px 18px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',whiteSpace:'nowrap'}}>+ Post Ad</a>
            <LanguageSwitcher/>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'48px 20px 80px'}}>
        <div style={{marginBottom:'40px'}}>
          <h1 style={{fontSize:'28px',fontWeight:900,color:'#111',marginBottom:'8px'}}>Terms of Use</h1>
          <div style={{fontSize:'13px',color:'#9CA3AF'}}>Last updated: May 31, 2026 · Effective immediately</div>
          <div style={{marginTop:'16px',padding:'16px 20px',background:'#EFF6FF',borderRadius:'12px',border:'1px solid #DBEAFE'}}>
            <div style={{fontSize:'13px',color:'#1d4ed8',lineHeight:1.7}}>
              HagerHub is a US-based platform. These Terms are governed by United States law. Please read carefully before using the Platform.
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
          {sections.map((s, i) => (
            <div key={i} style={{padding:'24px 0',borderBottom:'1px solid #F3F4F6'}}>
              <h2 style={{fontSize:'15px',fontWeight:700,color:'#111',marginBottom:'10px'}}>{s.title}</h2>
              <p style={{fontSize:'14px',color:'#374151',lineHeight:1.8}}>{s.content}</p>
            </div>
          ))}
        </div>

        <div style={{marginTop:'40px',padding:'20px 24px',background:'#F9FAFB',borderRadius:'12px',border:'1px solid #E5E7EB',textAlign:'center'}}>
          <div style={{fontSize:'13px',color:'#6B7280',lineHeight:1.7}}>
            By using HagerHub, you acknowledge that you have read, understood, and agree to these Terms of Use.
          </div>
          <a href={`/${locale}`} style={{display:'inline-block',marginTop:'16px',padding:'10px 24px',background:'#111',color:'white',borderRadius:'8px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
            Back to HagerHub
          </a>
        </div>
      </div>

      <footer style={{background:'#fff',borderTop:'1px solid #EBEBEB',padding:'24px 20px',textAlign:'center'}}>
        <div style={{fontSize:'12px',color:'#9CA3AF'}}>© 2026 HagerHub · All rights reserved · United States</div>
        <div style={{marginTop:'8px',display:'flex',justifyContent:'center',gap:'16px'}}>
          <a href={`/${locale}/terms`} style={{fontSize:'12px',color:'#6B7280',textDecoration:'none'}}>Terms of Use</a>
          <a href={`/${locale}`} style={{fontSize:'12px',color:'#6B7280',textDecoration:'none'}}>Help Center</a>
          <a href={`/${locale}`} style={{fontSize:'12px',color:'#6B7280',textDecoration:'none'}}>Contact</a>
        </div>
      </footer>
    </main>
  )
}
