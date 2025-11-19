export async function POST(req: Request) {
  const body = await req.json()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL // e.g. https://xyz.ngrok.io

  const response = await fetch(`${backendUrl}/plan/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), { status: response.status })
}