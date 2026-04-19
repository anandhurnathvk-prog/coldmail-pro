export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured." });

  const { company, website, role, industry } = req.body || {};
  if (!company?.trim()) return res.status(400).json({ error: "Company name is required." });

  const websiteHint = website ? ` Website: ${website}.` : '';
  const roleHint = role ? ` Prospect role: ${role}.` : '';
  const industryHint = industry ? ` Industry: ${industry}.` : '';

  const prompt = `You are the world's most elite B2B sales intelligence analyst. You have studied millions of companies across every industry, size, and geography. Your research is so accurate and specific that even the best enterprise sales reps rely on it daily.

You are researching: "${company}"${websiteHint}${industryHint}${roleHint}

YOUR MISSION: Produce a devastatingly accurate company intelligence brief that a world-class salesperson can use to write a cold email so personalized it feels impossible to ignore.

RESEARCH METHODOLOGY — analyze everything you know from ALL these angles:

1. COMPANY PROFILE
   - What they actually do (specific, not generic)
   - Their business model (SaaS, marketplace, services, product, etc.)
   - Their target customers and ideal customer profile
   - Their founding story and growth trajectory
   - Geographic presence and team size estimates

2. PRODUCT/SERVICE INTELLIGENCE
   - Their core product or service offering
   - Their pricing model if known
   - Their tech stack or operational approach
   - Key differentiators vs competitors
   - Known product gaps or limitations

3. PAIN POINT ANALYSIS — dig deep into ALL of these:
   - Operational inefficiencies at their stage
   - Sales and revenue challenges
   - Marketing and lead generation gaps
   - Hiring and talent acquisition struggles
   - Technology and infrastructure limitations
   - Customer retention and churn issues
   - Competitive pressures they face
   - Cash flow and financial pressures (especially startups)
   - Manual processes that slow them down
   - Scaling bottlenecks specific to their industry

4. INDUSTRY CONTEXT
   - Major trends disrupting their industry right now
   - Regulatory pressures or compliance challenges
   - Seasonal patterns that affect them
   - Industry-specific terminology and language they use

5. BEHAVIORAL INTELLIGENCE
   - What their leadership team cares about most
   - How they communicate (formal/casual/technical)
   - What kind of vendors/partners they typically work with
   - What would make them stop and read an email

6. COMPETITIVE LANDSCAPE
   - Their main competitors
   - How they differentiate
   - Competitive threats they're facing

FOR SMALL/UNKNOWN COMPANIES:
- Use the company name, website, and industry to make razor-sharp inferences
- Apply deep knowledge of what companies at that stage, in that industry, always struggle with
- A real estate startup like "Advent Terra" — think: lead generation, property management software, agent recruitment, deal pipeline visibility, competing with established agencies, manual CRM processes, slow transaction cycles
- Never say "I don't know" — always produce specific, actionable intelligence
- Small company pain points are often MORE specific and urgent than enterprise ones

FOR WELL-KNOWN COMPANIES:
- Go beyond surface level — what are they REALLY struggling with right now
- Reference specific known challenges, recent strategic shifts, or competitive pressures
- Think about what a VP or C-suite at that company loses sleep over

Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Just the JSON:
{
  "website": "URL string or null",
  "companyDescription": "2 razor-sharp sentences describing exactly what they do, who they serve, and their business model",
  "stage": "startup or scaleup or enterprise or smb",
  "industry": "their specific industry",
  "teamSize": "estimated team size range e.g. 1-10, 11-50, 51-200, 201-1000, 1000+",
  "painPoints": [
    "hyper-specific pain point #1 — written as something the prospect would actually say out loud",
    "hyper-specific pain point #2",
    "hyper-specific pain point #3",
    "hyper-specific pain point #4",
    "hyper-specific pain point #5"
  ],
  "competitorNames": ["competitor1", "competitor2", "competitor3"],
  "recentNews": "most compelling recent development, strategic move, or industry trend affecting them — 1 sentence, specific",
  "hiringFor": "what roles reveal about their priorities and gaps",
  "culture": "their communication style and culture — formal, startup-casual, technical, etc.",
  "emailHook": "the single most compelling, specific, and surprising angle for a cold email to this company RIGHT NOW — something that makes them think this sender really did their homework",
  "industryTrend": "one major industry trend they are navigating that creates urgency for your prospect",
  "talkingPoints": ["specific talking point 1", "specific talking point 2", "specific talking point 3"],
  "sources": ["source types used for research"]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || `API error ${response.status}` });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    if (!raw) return res.status(502).json({ error: "No research results. Please try again." });

    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return res.status(502).json({ error: "Could not parse research. Please try again." });
      try { parsed = JSON.parse(match[0]); }
      catch { return res.status(502).json({ error: "Malformed response. Please try again." }); }
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Research failed. Please try again." });
  }
}
