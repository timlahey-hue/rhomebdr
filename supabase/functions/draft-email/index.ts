import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DraftEmailRequest {
  contactName: string;
  contactCompany: string;
  contactRole: string;
  relationshipStage: string;
  actionType: string;
  lastNotes: string;
  voiceDescription: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contactName, 
      contactCompany, 
      contactRole, 
      relationshipStage,
      actionType,
      lastNotes,
      voiceDescription 
    }: DraftEmailRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert business development email ghostwriter for a high-end residential technology company called r:home. 

Your writing style should match this voice profile:
${voiceDescription}

Key principles:
- Never hard sell. Focus on building relationships and adding value.
- Keep emails SHORT (3-5 sentences max for the body)
- Be warm but professional
- Reference specific context when available
- Avoid generic phrases like "I hope this email finds you well"
- Make every word count

Your output should be a JSON object with:
- subject: A compelling but not salesy subject line (max 50 chars)
- body: The email body (no greeting/signature, just the message)`;

    const userPrompt = `Draft a follow-up email for:

Contact: ${contactName}
Company: ${contactCompany}
Role: ${contactRole}
Relationship Stage: ${relationshipStage}
Action Type: ${actionType}
Context/Notes: ${lastNotes || 'No previous notes'}

Write an email that feels personal and relationship-focused, not transactional.`;

    console.log('Generating email draft for:', contactName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('Raw AI response:', content);
    
    let emailDraft;
    try {
      emailDraft = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      emailDraft = {
        subject: `Following up - ${contactCompany}`,
        body: content || 'Unable to generate email draft. Please try again.'
      };
    }

    console.log('Email draft generated successfully');

    return new Response(JSON.stringify(emailDraft), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in draft-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
