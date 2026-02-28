import Anthropic from '@anthropic-ai/sdk';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'engagement' | 'setup' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  action?: { label: string; href: string };
};

export async function generateRecommendations(orgData: {
  orgName: string;
  gameCount: number;
  roomCount: number;
  bookingCount: number;
  totalRevenue: number;
  hasStripe: boolean;
  hasPricing: boolean;
  hasSchedules: boolean;
  recentBookings: number;
  avgPlayersPerBooking: number;
  peakDays: string[];
  peakHours: string[];
}): Promise<Recommendation[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[AI Recommendations] ANTHROPIC_API_KEY not set, returning empty');
    return [];
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 500,
      system: `You are a booking optimization expert. Analyze venue data and provide 3-5 actionable recommendations. Return JSON array only, no markdown. Each item: {"id":"unique","title":"short title","description":"1 sentence actionable advice","category":"revenue|engagement|setup|optimization","priority":"high|medium|low"}. Be specific with numbers. Keep descriptions under 20 words.`,
      messages: [{
        role: 'user',
        content: JSON.stringify(orgData),
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '[]';
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  } catch (err) {
    console.error('[AI Recommendations] Error:', err);
    return [];
  }
}
