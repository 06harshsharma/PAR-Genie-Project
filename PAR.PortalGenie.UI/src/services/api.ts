
export async function askGenie(query: string): Promise<string> {
  // Adjust to your actual endpoint
  const res = await fetch('http://localhost:5243/api/genie/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  return data.reply ?? 'No response from service.'
}
