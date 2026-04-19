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
    call: "book a 15-minute discovery call — frame it as low-stakes and easy to say yes to",
    demo: "schedule a product demo — make them so curious they have to see it",
    reply: "get a reply — make them feel genuinely compelled to respond",
    partnership: "explore a partnership — make it feel like mutual opportunity, not a pitch",
  };
  const TONE_MAP = {
    direct: "direct and confident — ruthlessly edited, every word earns its place, zero fluff",
    casual: "warm and conversational — like a smart friend who happens to have something genuinely useful, never salesy",
    formal: "polished and authoritative — appropriate for C-suite and enterprise decision makers",
    witty: "sharp and subtly clever — one well-placed insight that makes them smile, never try-hard",
  };
  const LEN_MAP = {
    short: "brutally short — 3 sentences maximum. If it can't be said in 3, cut harder.",
    medium: "tight and punchy — 5 to 7 sentences. Every sentence must move the needle.",
    long: "substantive but never bloated — 8 to 10 sentences. Earns its length with real specificity.",
  };

  const brief = companyBrief || '';
  const websiteInfo = website ? `\nWEBSITE: ${website}` : '';

  const prompt = `You are the greatest cold email copywriter alive. You've written emails that have opened doors at Google, closed Series A rounds, and landed partnerships that changed companies. Your emails are studied in sales training courses.

You know that the greatest cold emails share these qualities:
— They feel like they were written by a real human who spent 30 minutes researching before writing for 5 minutes
— They open with something so specific the prospect thinks "how did they know that?"
— They connect one real observation to one real pain in one elegant sentence
— They introduce value as a natural next step, not a pitch
— They end with the single lowest-friction CTA possible
— They have natural rhythm — short punchy lines next to longer, considered ones
— They use contractions everywhere: I've, you're, it's, we'd, that's, don't, won't, can't
— They sound like a peer who genuinely cares, not a vendor who needs quota

ABSOLUTE BANNED PHRASES — never use these, ever:
synergy, leverage, circle back, touch base, game-changer, innovative, seamless, robust, scalable, paradigm, holistic, bandwidth, deep dive, move the needle, reach out, hope this finds you, my name is, I wanted to, I'm reaching out, at the end of the day, value proposition, pain points, low-hanging fruit, best-in-class, world-class, cutting-edge, revolutionary, disruptive, transformative, utilize, facilitate, endeavor

PROSPECT: ${prospect || 'the prospect'}
COMPANY: ${company || 'their company'}
ROLE: ${role || 'decision maker'}${websiteInfo}
SELECTED PAIN POINT: ${painPoint || 'operational inefficiency and growth challenges'}
YOUR PRODUCT/SERVICE: ${yourProduct}
EMAIL GOAL: ${GOAL_MAP[goal] || GOAL_MAP.call}
TONE: ${TONE_MAP[tone] || TONE_MAP.direct}
LENGTH: ${LEN_MAP[length] || LEN_MAP.medium}

${brief ? `DEEP COMPANY INTELLIGENCE:\n${brief}\n\nUSE THIS INTELLIGENCE — reference specific details, use their language, speak to their exact situation.` : ''}

YOUR WRITING PROCESS:
1. From the research, find ONE hyper-specific detail that proves you actually know their world
2. Connect it to the selected pain point in a way that feels inevitable, not forced
3. Show how your product removes that specific pain — one sentence, no feature lists
4. Make the CTA so easy and specific it would feel rude NOT to reply
5. Read it back — does it sound like something a real human sent at 2pm on a Tuesday? If not, rewrite.

FOLLOW-UP EMAIL RULES:
— Never open with "just following up", "circling back", "bumping this up", or any variant
— Add a completely new angle, insight, or data point they haven't heard yet
— Reference the first email in ONE sentence maximum
— Should feel like a fresh email that happens to reference a previous one
— Make it even more specific than the first

SUBJECT LINE RULES:
— Never use clickbait, all caps, excessive punctuation, or emojis
— Should feel like something a real person wrote, not a marketing team
— Under 8 words preferred
— Make the prospect think "how did they know to send me this?"

Return ONLY a raw JSON object. No markdown. No backticks. No explanation:
{
  "subject": "primary subject line",
  "body": "full email body with real \\n line breaks between paragraphs",
  "followUp": "day-3 follow-up email with real \\n line breaks",
  "tips": [
    "hyper-specific tactical tip #1 for THIS email",
    "hyper-specific tactical tip #2",
    "hyper-specific tactical tip #3"
  ],
  "subjectAlternatives": ["alternative subject line 1", "alternative subject line 2"],
  "sendTime": "best day and time to send this specific email and why",
  "objectionHandler": "how to respond if they say they're happy with their current solution"
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
        max_tokens: 1800,
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
