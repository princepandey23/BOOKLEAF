const { GoogleGenerativeAI } = require('@google/generative-ai');

const KNOWLEDGE_BASE = `
BookLeaf Publishing Knowledge Base:

COMPANY: Self-publishing company in India & US. Packages: Standard Free and Bestseller Breakthrough (premium).
Services: cover design, typesetting, ISBN assignment, printing, distribution, royalty management.
Printing: In-house (Delhi), Repro India, Epitome Books.

ROYALTY POLICY:
- 80/20 split: 80% net profit to author, 20% to BookLeaf.
- Net profit = MRP minus printing cost, platform commission, shipping.
- Calculated quarterly, paid within 45 days after quarter ends.
- Minimum threshold: ₹1,000 (rolls over if below).
- Paid via bank transfer to account in dashboard.

ISBN POLICY:
- Unique ISBN per book under BookLeaf's publisher imprint.
- Author can get own-imprint ISBN independently.
- ISBN errors = high priority, escalated to production team.

PRINTING & QUALITY:
- Standard turnaround: 5–7 business days.
- Quality issues → free reprint after verification (author shares photos).

DISTRIBUTION:
- Platforms: Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store.
- New listings live in 7–10 business days after publication.
- "Unavailable" on platform = stock sync issue → re-sync in 24–48 hours.

PRODUCTION STAGES:
Manuscript Received → Editing → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live

TONE: Empathetic, professional, specific (include dates/numbers), own mistakes directly, give clear timelines, end with clear next step.
`;

const CATEGORIES = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

let genAI = null;

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const classifyTicket = async (subject, description) => {
  const ai = getGenAI();
  if (!ai) return { category: 'General Inquiry', priority: 'Medium', aiAvailable: false };

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a support ticket classifier for BookLeaf Publishing.

Ticket Subject: ${subject}
Ticket Description: ${description}

Classify this ticket into exactly one category from: ${CATEGORIES.join(', ')}
Assign priority from: ${PRIORITIES.join(', ')}

Priority guidelines:
- Critical: financial disputes, payment not received 6+ months, ISBN corruption
- High: royalty overdue, quality defects, book unavailable on all platforms
- Medium: production delays, single platform issues, royalty queries
- Low: general questions, metadata updates, bio changes

Respond ONLY in this exact JSON format (no markdown):
{"category": "...", "priority": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const json = JSON.parse(text);
    if (CATEGORIES.includes(json.category) && PRIORITIES.includes(json.priority)) {
      return { ...json, aiAvailable: true };
    }
    return { category: 'General Inquiry', priority: 'Medium', aiAvailable: true };
  } catch (err) {
    console.error('Gemini classify error:', err.message);
    return { category: 'General Inquiry', priority: 'Medium', aiAvailable: false };
  }
};

const generateDraftResponse = async (ticket, authorName, bookData) => {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const bookContext = bookData ? `
Relevant Book Data:
- Title: ${bookData.title}
- Status: ${bookData.status}
- MRP: ₹${bookData.mrp}
- Total Copies Sold: ${bookData.total_copies_sold}
- Total Royalty Earned: ₹${bookData.total_royalty_earned}
- Royalty Paid: ₹${bookData.royalty_paid}
- Royalty Pending: ₹${bookData.royalty_pending}
- Last Payout Date: ${bookData.last_royalty_payout_date || 'Never'}
- Available On: ${bookData.available_on?.join(', ') || 'N/A'}
` : '';

    const prompt = `You are a BookLeaf Publishing support representative. Use the knowledge base and author data to write a helpful, empathetic response.

${KNOWLEDGE_BASE}

Author Name: ${authorName}
Ticket Category: ${ticket.category}
Priority: ${ticket.priority}
Subject: ${ticket.subject}
Description: ${ticket.description}
${bookContext}

Write a professional, empathetic response (150-250 words) that:
1. Addresses the author by first name
2. Acknowledges their specific concern
3. Provides concrete information using the actual data above
4. Gives a clear next step or timeline
5. Signs off as "BookLeaf Support Team"

Do NOT use generic fluff. Be specific and actionable. Do not use markdown formatting.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini draft error:', err.message);
    return null;
  }
};

module.exports = { classifyTicket, generateDraftResponse };
