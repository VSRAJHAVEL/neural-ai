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

${code}

Improvements to make:
- Add accessibility attributes (aria-labels, roles)
- Improve performance (memoization if needed)
- Add hover effects and transitions
- Ensure responsive design
- Add comments for complex logic
- Follow React best practices

Return ONLY valid JSON in this format:
{
  "optimizedCode": "... the improved code ...",
  "notes": "Brief bullet points of improvements made"
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
    
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/```\s*$/, '');
    }

    const result = JSON.parse(cleanedContent);
    return result;
  } catch (error) {
    console.error('AI optimization error:', error);
    throw new Error(`Failed to optimize code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
