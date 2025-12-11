import { Layout } from '../../client/src/lib/types';

interface GeneratedFile {
  name: string;
  content: string;
  language: string;
}

interface GenerationResult {
  files: GeneratedFile[];
  readme: string;
  notes?: string;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateCodeWithAI(layout: Layout): Promise<GenerationResult> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `You are an expert React developer. Generate production-ready code from this layout specification.

Layout data:
${JSON.stringify(layout, null, 2)}

Generate:
1. A complete React component file (App.jsx) that renders this layout
2. A CSS file (index.css) with Tailwind-based styling
3. Any additional component files if needed

Requirements:
- Use modern React with functional components
- Apply Tailwind CSS classes based on the component props
- Maintain the component hierarchy and nesting
- Handle images, buttons, text, links, containers, sections, cards properly
- Use the exact colors and styles from props (backgroundColor, borderRadius, padding, etc.)
- Make it production-ready with proper imports

Return ONLY valid JSON in this exact format:
{
  "files": [
    {"name": "App.jsx", "content": "...", "language": "jsx"},
    {"name": "index.css", "content": "...", "language": "css"}
  ],
  "readme": "# Generated Project\\n\\nSetup instructions here",
  "notes": "Brief description of what was generated"
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a code generation assistant. Always return valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from AI');
    }

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/```\s*$/, '');
    }

    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function optimizeCodeWithAI(code: string): Promise<{ optimizedCode: string; notes: string }> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `You are an expert React developer. Optimize and improve this React code:

\`\`\`
${code}
\`\`\`

Improvements to make:
- Add accessibility attributes (aria-labels, roles)
- Improve performance (memoization if needed)
- Add hover effects and transitions
- Ensure responsive design
- Add comments for complex logic
- Follow React best practices

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{"optimizedCode": "...the complete improved code here with newlines escaped...", "notes": "Brief bullet points of improvements made"}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a code optimization assistant. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    let cleanedContent = content.trim();
    
    // Try to extract JSON from the response
    // First try removing markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
      cleanedContent = cleanedContent.replace(/```\s*$/, '').trim();
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
      cleanedContent = cleanedContent.replace(/```\s*$/, '').trim();
    }
    
    // Try to find JSON object if it's embedded in text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error) {
    console.error('AI optimization error:', error);
    throw new Error(`Failed to optimize code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function optimizeLayoutWithAI(layout: Layout): Promise<{ optimizedLayout: Layout; notes: string }> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `You are an expert UI/UX designer and React developer. Analyze and optimize this website layout for better user experience and design:

Current Layout:
${JSON.stringify(layout, null, 2)}

Optimization suggestions:
- Improve component hierarchy and organization
- Better spacing and alignment
- Suggest reordering components for better user flow
- Group related components together
- Add missing layout components (headers, footers, sections)
- Ensure semantic HTML structure

Return ONLY valid JSON with the optimized layout structure. Keep all component data but reorganize as needed:
{
  "optimizedLayout": {
    "components": [...the reorganized components...]
  },
  "notes": "Bullet points explaining the improvements made"
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a UI/UX optimization assistant. Return valid JSON only. Maintain all component data while optimizing structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/```\s*$/, '');
    }

    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error) {
    console.error('AI layout optimization error:', error);
    throw new Error(`Failed to optimize layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
