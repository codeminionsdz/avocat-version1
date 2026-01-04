import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// POST /api/insights/ai-assist - AI writing assistance for legal insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, title, content } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    let prompt = ''
    let systemPrompt = `You are an AI assistant helping lawyers write professional, educational legal insights for the Avoca platform. 

CRITICAL RULES:
- Legal insights must be INFORMATIONAL ONLY - never provide direct legal advice
- Detect and warn about any language that sounds like legal advice (commands, promises, specific recommendations to individuals)
- Content should educate the public about legal concepts, not solve specific legal problems
- Maintain professional, clear language
- Avoid complex legal jargon when possible
- Be concise and actionable`

    switch (action) {
      case 'suggest_titles':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for title suggestions' }, { status: 400 })
        }
        prompt = `Based on this legal insight content, suggest 5 professional, engaging titles (10-50 words each) that accurately represent the content:

Content:
${content}

Return ONLY a JSON array of strings, nothing else. Example: ["Title 1", "Title 2", ...]`
        break

      case 'check_clarity':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for clarity check' }, { status: 400 })
        }
        prompt = `Analyze this legal insight for clarity and readability. Identify any issues and provide specific suggestions:

Content:
${content}

Return a JSON object with this structure:
{
  "score": <0-10, where 10 is perfectly clear>,
  "issues": [
    {"type": "jargon|complexity|structure|readability", "text": "problematic text", "suggestion": "how to fix it"}
  ],
  "overall_feedback": "brief summary"
}`
        break

      case 'detect_legal_advice':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for legal advice detection' }, { status: 400 })
        }
        prompt = `Analyze this legal insight content for any language that could be interpreted as direct legal advice rather than general legal information.

Look for:
- Direct commands ("you should", "you must", "do this")
- Specific recommendations to individuals
- Promises or guarantees of outcomes
- Language that creates attorney-client relationship expectations

Content:
${content}

Return a JSON object:
{
  "risk_level": "none|low|medium|high",
  "warnings": [
    {"text": "problematic phrase", "reason": "why it's problematic", "suggestion": "how to rephrase"}
  ],
  "overall_assessment": "brief explanation"
}`
        break

      case 'suggest_tags':
        if (!content && !title) {
          return NextResponse.json({ error: 'Title or content is required for tag suggestions' }, { status: 400 })
        }
        prompt = `Based on this legal insight, suggest 3-7 relevant tags that would help users find this content:

${title ? `Title: ${title}` : ''}
${content ? `Content: ${content}` : ''}

Return ONLY a JSON array of strings (short tags, 1-3 words each), nothing else. Example: ["contract law", "small business", "liability"]`
        break

      case 'improve_content':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for content improvement' }, { status: 400 })
        }
        prompt = `Improve this legal insight content while maintaining its core message. Make it:
- More clear and concise
- More educational (not advisory)
- More engaging for general public
- Free of complex jargon
- Professional yet accessible

Original content:
${content}

Return a JSON object:
{
  "improved_content": "the improved version",
  "changes_made": ["list of key improvements"]
}`
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Parse JSON response
    try {
      const result = JSON.parse(responseText)
      return NextResponse.json({ result })
    } catch (parseError) {
      // If response is not JSON, return as-is
      return NextResponse.json({ result: responseText })
    }

  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI assistance' },
      { status: 500 }
    )
  }
}
