export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured on server." });

  const { prospect, company, role, painPoint, yourProduct, goal, tone, length, website, companyBrief } = req.body || {};
  if (!yourProduct?.trim()) return res.status(400).json({ error: "yourProduct is required." });

  const GOAL_MAP = {
    call: "book a quick 15-minute discovery call — make it feel low stakes and easy to say yes",
    demo: "schedule a product demo — make them curious enough to want to see it",
    reply: "simply get a reply — make them feel compelled to respond",
    partnership: "explore a potential partnership — position it as mutual benefit",
  };
  const TONE_MAP = {
    direct: "direct and confident — strip every unnecessary word, get to the value fast",
    casual: "warm and human — like a smart friend who happens to have something useful",
    formal: "polished and professional — appropriate for C-suite and enterprise",
    witty: "sharp and memorable — a little wit, never try-hard, leaves an impression",
  };
  const LEN_MAP = {
    short: "brutally short — 3 sentences max. Every word must earn its place.",
    medium: "tight and punchy — 5 to 7 sentences. No filler.",
    long: "detailed but never bloated — 8 to 10 sentences with real substance.",
  };

  const brief = companyBrief ? `\n\nDEEP COMPANY RESEARCH:\n${companyBrief}` : '';
  const websiteInfo = website ? `\nCOMPANY WEBSITE: ${website}` : '';

  const prompt = `You are the world's best B2B sales copywriter. You've spent 20 years writing cold emails that actually get replies. You know that the best cold emails feel like they were written by a thoughtful human who genuinely did their homework — not a template, not AI, not a spray-and-pray campaign.

Your emails have these qualities:
- They open with something SPECIFIC to the prospect — a real observation, not a compliment
- They connect that observation to a real business problem in ONE sentence
- They introduce the solution naturally — not as a pitch, as a logical next step
- They end with the most frictionless CTA possible
- They sound like a peer, not a vendor
- They have rhythm — short sentences punching next to longer ones
- They use contractions: I've, you're, it's, we'd, that's, don't
- They NEVER use: synergy, leverage, circle back, touch base, game-changer, innovative, seamless, robust, scalable, paradigm, holistic, bandwidth, deep dive, move the needle, at the end of the day
- They never open with "I hope", "My name is", "I wanted to reach out", or any variation
- They feel like the sender spent 20 minutes researching before writing 3 minutes

PROSPECT NAME: ${prospect || 'the prospect'}
COMPANY: ${company || 'their company'}
PROSPECT ROLE: ${role || 'not specified'}${websiteInfo}
KNOWN PAIN POINT: ${painPoint || 'general growth and efficiency'}
MY PRODUCT/SERVICE: ${yourProduct}
EMAIL GOAL: ${GOAL_MAP[goal] || GOAL_MAP.call}
TONE: ${TONE_MAP[tone] || TONE_MAP.direct}
LENGTH: ${LEN_MAP[length] || LEN_MAP.medium}${brief}

WRITING PROCESS — follow this exactly:
1. Find ONE specific, real detail from the research that would make the prospect think "how did they know that?"
2. Connect it to a pain point they're ACTUALLY feeling right now
3. Make the connection to your product feel inevitable, not forced
4. Write the CTA so it sounds like something a human would actually say

FOLLOW-UP EMAIL RULES:
- Don't say "just following up" or "circling back" — ever
- Add a genuinely new angle, insight, or hook
- Reference the first email once, briefly
- Should feel like it was written fresh, not copied

Return ONLY a raw JSON object. No markdown. No backticks. No explanation:
{"subject":"string","body":"string with real \\n line breaks","followUp":"string with real \\n line breaks","tips":["string","string","string"],"subjectAlternatives":["string","string"]}

tips = 3 hyper-specific tactical suggestions for THIS email
subjectAlternatives = 2 alternative subject lines with different angles`;

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
    if (!raw) return res.status(502).json({ error: "Empty response. Please try again." });

    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return res.status(502).json({ error: "Could not parse response. Please try again." });
      try { parsed = JSON.parse(match[0]); }
      catch { return res.status(502).json({ error: "Malformed response. Please try again." }); }
    }

    if (!parsed.subject || !parsed.body) return res.status(502).json({ error: "Incomplete response. Please try again." });
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error. Please try again." });
  }
}
