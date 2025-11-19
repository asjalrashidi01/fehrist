export async function POST(req: Request) {
  const body = await req.json()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const response = await fetch(`${backendUrl}/plan/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), { status: response.status })
}