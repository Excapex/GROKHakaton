/** xAI grok-4.6. Call only from Convex actions / Node. Never import from src/. */

const XAI_URL = "https://api.x.ai/v1/chat/completions";

function readEnv(name: string): string | undefined {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name];
}

export async function grokJson(args: {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}): Promise<unknown> {
  const key = readEnv("XAI_API_KEY");
  if (!key) {
    throw new Error("XAI_API_KEY nije postavljen na Convex/server env");
  }
  const model = readEnv("XAI_MODEL") ?? "grok-4.6";
  const response = await fetch(XAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: args.schemaName,
          strict: true,
          schema: args.schema,
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`xAI HTTP ${response.status}`);
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("xAI prazan odgovor");
  }
  return JSON.parse(content);
}
