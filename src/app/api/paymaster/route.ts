export async function POST(r: Request)  {
    const req = await r.json()
    const method = req.method
    
    if (method === ['pm_getPaymasterStubData', 'pm_getPaymasterData'].includes(method)) {
        const res = await fetch(process.env.REACT_APP_PAYMASTER_SERVICE_URL || "", {
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(req)
          })
          return Response.json(await res.json())
    } 
    return Response.json({error: 'Method not found'})
}