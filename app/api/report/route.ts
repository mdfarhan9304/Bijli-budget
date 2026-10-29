import { NextResponse } from 'next/server';
import { createLocalReport, type ReportInput, type SavingsReport } from '@/lib/report';

export const runtime = 'nodejs';

function isReportInput(value: unknown): value is ReportInput {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return typeof data.region === 'string' && typeof data.amount === 'number' && typeof data.units === 'number' && typeof data.rate === 'number' && Array.isArray(data.actions);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isReportInput(body)) return NextResponse.json({ error: 'Invalid report data.' }, { status: 400 });
  const fallback = createLocalReport(body);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ report: fallback, mode: 'local' });

  const prompt = `Create a concise electricity savings report from this verified calculation data. Use only the numbers supplied. Do not invent appliance costs, tariffs, carbon claims, or savings. Keep it helpful and specific to an Indian household bill. Return JSON only with headline, summary, observations (exactly 3 strings), actions (up to 3 objects with title, detail, saving), and caveat.\n\n${JSON.stringify(body)}`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_REPORT_MODEL || 'gpt-6-luna', input: prompt, text: { format: { type: 'json_object' } } }),
    });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const data = await response.json() as { output_text?: string };
    const generated = JSON.parse(data.output_text || '{}') as Omit<SavingsReport, 'generatedBy'>;
    if (!generated.headline || !generated.summary || !Array.isArray(generated.observations) || !Array.isArray(generated.actions) || !generated.caveat) throw new Error('Incomplete response');
    return NextResponse.json({ report: { ...generated, generatedBy: 'OpenAI' } satisfies SavingsReport, mode: 'ai' });
  } catch {
    return NextResponse.json({ report: fallback, mode: 'local' });
  }
}
