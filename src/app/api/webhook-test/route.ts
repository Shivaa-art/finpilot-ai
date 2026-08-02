export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (!body.url) {
    return Response.json({ ok: false, error: "Missing webhook URL." }, { status: 400 });
  }

  try {
    const target = new URL(body.url);
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      return Response.json({ ok: false, error: "URL must be http or https." }, { status: 400 });
    }

    const res = await fetch(target.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "finpilot.test",
        message: "This is a test webhook from FinPilot AI.",
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });

    return Response.json({ ok: res.ok, status: res.status });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to reach that URL." },
      { status: 200 }
    );
  }
}
