import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  console.log('placeBet called with body:', body.apiKey, body.betAmount, body.outcomeToBuy, body.marketID);
  
  const res = await fetch('https://manifold.markets/api/v0/bet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${body.apiKey}`,
    },
    body: JSON.stringify({
      amount: body.betAmount,
      outcome: body.outcomeToBuy,
      contractId: body.marketID,
    }),
  });

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error(errorDetails);
    return NextResponse.error();
  }

  const data = await res.json();

  console.log(data)

  return NextResponse.json(data)
}