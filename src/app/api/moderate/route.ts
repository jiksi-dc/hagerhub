import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, price } = await request.json()

    const prompt = `You are a content moderator for HagerHub, Ethiopia's #1 marketplace. 
Analyze this listing and determine if it should be approved or rejected.

Listing Details:
- Title: ${title}
- Category: ${category}  
- Price: ${price}
- Description: ${description}

Reject if the listing contains ANY of the following:
1. Weapons, firearms, ammunition
2. Drugs, narcotics, illegal substances
3. Explicit or adult content
4. Scam indicators (unrealistic prices, requests for upfront payment, lottery wins)
5. Stolen goods
6. Human trafficking or exploitation
7. Hate speech or discriminatory content
8. Counterfeit or fake branded goods
9. Protected wildlife or illegal animal trade
10. Political propaganda

Respond in JSON format only:
{
  "approved": true/false,
  "reason": "brief explanation",
  "risk_level": "low/medium/high",
  "flags": ["list of specific concerns if any"]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content[0].text
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json(result)
  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json({ approved: true, reason: 'Moderation service unavailable', risk_level: 'low', flags: [] })
  }
}
