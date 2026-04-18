export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured on server." });

  const { prospect, company, role, painPoint, yourProduct, goal, tone, length } = req.body || {};
  if (!yourProduct?.trim()) return res.status(400).json({ error: "yourProduct is required." });

  const GOAL_MAP = {
    call: "book a quick 15-minute call",
    demo: "schedule a product demo",
    reply: "get a reply and start a conversation",
    partnership: "explore a potential partnership",
  };
  const TONE_MAP = {
    direct: "direct and confident — no fluff, get to the point fast",
    casual: "warm and conversational — like a real person messaging a peer",
    formal: "professional — suitable for senior executive outreach",
    witty: "clever and slightly witty — memorable without trying too hard",
  };
  const LEN_MAP = {
    short: "very short — 3 to 4 sentences only",
    medium: "moderate — around 5 to 7 sentences",
    long: "detailed — 8 to 10 sentences",
  };

  const prompt = `You are a world-class B2B sales copywriter. Your emails are famous for sounding completely human — warm, specific, never robotic. Real people read them and think a real thoughtful human wrote them.

Write a cold outreach email with these details:

PROSPECT: ${prospect || "the prospect"}
COMPANY: ${company || "their company"}
ROLE: ${role || "not specified"}
PAIN POINT: ${painPoint || "general growth and efficiency"}
MY PRODUCT/SERVICE: ${yourProduct}
GOAL: ${GOAL_MAP[goal] || GOAL_MAP.call}
TONE: ${TONE_MAP[tone] || TONE_MAP.direct}
LENGTH: ${LEN_MAP[length] || LEN_MAP.medium}

RULES — follow every single one:
- NEVER start with "I hope this finds you well" or any filler opener
- NEVER use buzzwords: synergy, leverage, circle back, touch base, game-changer, holistic
- Use contractions naturally: I've, you're, it's, don't, we'd, that's
- Mix short punchy sentences with longer flowing ones — vary the rhythm like a human does
- Reference the company or prospect by name — make it feel personally researched
- Write ONE clear idea — don't list features or bullet anything
- End with ONE specific easy call to action
- The follow-up should sound like a real person bumping an email thread casually
- Sound like a smart colleague who did their homework, not a sales bot

Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Just JSON:
{"subject":"string","body":"string with \\n for line breaks","followUp":"string with \\n for line breaks","tips":["string","string","string"]}

Tips = 3 specific suggestions to improve reply rate for THIS specific email.`;

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
        max_tokens: 1024,
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
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
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
