import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const { data: listings } = await supabase
      .from('listings')
      .select('id,title,price_label,category,city,neighbourhood')
      .eq('status','active')
      .limit(20)

    const listingsContext = listings?.map(l =>
      `- ${l.title} | ${l.price_label} | ${l.category} | ${l.city}`
    ).join('\n') || 'No listings available'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are HagerHub AI Assistant — Ethiopia's #1 marketplace assistant.
Help users find listings, answer questions about the platform, assist buyers and sellers.
Respond in the same language the user writes in (Amharic, Arabic, French, or English).
Current listings:\n${listingsContext}
Be concise, friendly, and use Ethiopian context.`,
      messages: [{ role: 'user', content: message }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return Response.json({ reply: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ reply: 'Sorry, I am having trouble connecting. Please try again.' }, { status: 500 })
  }
}
