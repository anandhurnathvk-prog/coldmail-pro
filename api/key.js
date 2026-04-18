export default function handler(req, res) {
  const key = process.env.GEMINI_API_KEY || '';
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`window.__GMKEY__ = "${key}";`);
}
