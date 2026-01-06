import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  contactName: string;
  company: string;
  role: string;
  website?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactName, company, role, website }: ResearchRequest = await req.json();
    
    console.log('Researching contact:', { contactName, company, role, website });

    let websiteContent = '';
    let scrapedData: any = null;

    // Step 1: Scrape website if provided
    if (website) {
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (firecrawlKey) {
        try {
          let formattedUrl = website.trim();
          if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `https://${formattedUrl}`;
          }

          console.log('Scraping website:', formattedUrl);

          const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: formattedUrl,
              formats: ['markdown'],
              onlyMainContent: true,
            }),
          });

          if (scrapeResponse.ok) {
            scrapedData = await scrapeResponse.json();
            websiteContent = scrapedData?.data?.markdown || scrapedData?.markdown || '';
            console.log('Website scraped successfully, content length:', websiteContent.length);
          } else {
            console.error('Firecrawl error:', await scrapeResponse.text());
          }
        } catch (scrapeError) {
          console.error('Error scraping website:', scrapeError);
        }
      }
    }

    // Step 2: Search for AV partnerships and news
    let searchResults = '';
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (firecrawlKey) {
      try {
        const searchQuery = `"${company}" OR "${contactName}" audio visual AV technology integrator partner residential`;
        console.log('Searching for AV partnerships:', searchQuery);

        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5,
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData?.data && Array.isArray(searchData.data)) {
            searchResults = searchData.data
              .map((r: any) => `- ${r.title}: ${r.description || ''}`)
              .join('\n');
            console.log('Search results found:', searchData.data.length);
          }
        }
      } catch (searchError) {
        console.error('Error searching:', searchError);
      }
    }

    // Step 3: Use AI to generate summary
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a business intelligence analyst for r:home, a high-end residential technology company. 
Your job is to research architects, builders, interior designers, landscape designers, and real estate advisors 
to help the business development team understand who they are and identify potential AV (audio/visual) integration partners they work with.

Be concise and focus on actionable insights. Format your response as JSON with these fields:
- summary: A 2-3 sentence executive summary of who this person/company is
- avPartners: A brief note about any AV integrators, technology companies, or smart home partners they might work with (based on search results or inference from their work type)`;

    const userPrompt = `Research this contact:
Name: ${contactName}
Company: ${company}
Role: ${role}
Website: ${website || 'Not provided'}

${websiteContent ? `Website Content:\n${websiteContent.substring(0, 4000)}` : ''}

${searchResults ? `Search Results for AV Partnerships:\n${searchResults}` : ''}

Please provide an executive summary and identify any potential AV/technology integration partners.`;

    console.log('Calling AI for analysis...');

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "research_result",
              description: "Return the research findings",
              parameters: {
                type: "object",
                properties: {
                  summary: { 
                    type: "string", 
                    description: "2-3 sentence executive summary of who this person/company is" 
                  },
                  avPartners: { 
                    type: "string", 
                    description: "Potential AV integrators or technology partners they might work with" 
                  }
                },
                required: ["summary", "avPartners"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "research_result" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Parse the tool call response
    let result = { summary: '', avPartners: '' };
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error('Error parsing tool response:', parseError);
        // Fallback to content if available
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          result.summary = content.substring(0, 500);
        }
      }
    }

    console.log('Research complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in research-contact function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to research contact' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});