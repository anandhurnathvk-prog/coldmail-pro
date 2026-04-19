export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured." });

  const { company, website, role } = req.body || {};
  if (!company?.trim()) return res.status(400).json({ error: "Company name is required." });

  const websiteHint = website ? ` (website: ${website})` : '';
  const roleHint = role ? ` The prospect's role is ${role}.` : '';

  const prompt = `You are an elite sales intelligence analyst. Research the company "${company}"${websiteHint} thoroughly and produce a deep intelligence brief that a top salesperson would use to write a hyper-personalized cold email.${roleHint}

Search and analyze ALL of these sources:
1. Their official website — homepage, about, product/service pages, blog, careers
2. LinkedIn company page — size, growth, recent posts, hiring patterns
3. Recent news articles — funding, launches, expansions, challenges, leadership changes
4. Job postings — what they're hiring for reveals priorities, gaps, and pain points
5. G2, Capterra, or Trustpilot reviews — what their customers love AND complain about
6. Glassdoor — what employees say about culture, challenges, management
7. Reddit, Twitter/X, forums — candid public conversations about the company
8. Press releases — strategic direction, partnerships, product launches
9. Industry reports — sector-wide challenges that likely affect them
10. Competitor landscape — who they compete with and how they position

From all this, produce:
- What the company actually does (specific, not generic)
- Their growth stage and recent trajectory
- Their most likely REAL pain points right now (3-5 specific ones, ranked by likelihood)
- What they're clearly investing in / prioritizing
- Any recent news, wins, or struggles worth referencing
- The company's tone and culture (startup scrappy vs enterprise formal)
- What would make someone at this company stop scrolling and read an email
- Their website URL if you found it

Return ONLY a raw JSON object:
{
  "website": "string or null",
  "companyDescription": "2 sentence description of what they actually do",
  "stage": "startup/scaleup/enterprise/smb",
  "painPoints": ["most likely pain point","second","third","fourth","fifth"],
  "recentNews": "most interesting recent development worth referencing in an email, or null",
  "hiringFor": "what roles they are actively hiring for, or null",
  "culture": "brief culture/tone description",
  "emailHook": "the single most compelling angle for a cold email to this company right now",
  "sources": ["source1","source2","source3"]
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
        max_tokens: 1200,
        tools: [{
          type: "web_search_20250305",
          name: "web_search"
        }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || `API error ${response.status}` });
    }

    const data = await response.json();
    const textBlock = data.content?.find(b => b.type === "text");
    const raw = textBlock?.text || "";
    if (!raw) return res.status(502).json({ error: "No research results. Please try again." });

    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return res.status(502).json({ error: "Could not parse research. Please try again." });
      try { parsed = JSON.parse(match[0]); }
      catch { return res.status(502).json({ error: "Malformed research response." }); }
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Research failed. Please try again." });
  }
}
