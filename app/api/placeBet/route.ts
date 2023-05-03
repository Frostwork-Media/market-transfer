import { NextResponse } from 'next/server';

// import fetch from 'node-fetch';

export async function POST(request: Request) {
  const body = await request.json();
  
  const sendTime = Date.now();

  console.log('placeBet called with body:', body.apiKey, body.betAmount, body.outcomeToBuy, body.marketID);
  
  const res = await fetch('https://manifold.markets/api/v0/bet', {
    cache: 'no-store',
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
    return NextResponse.json({error: "Error placing the bet"}, {status: 500 });
  }
  
  const data = await res.json() as any;
  
  if ('fills' in data) {
    const betTimestamp = data.fills[0].timestamp;

  // Check if the bet's timestamp is before sendTime
  if (betTimestamp < sendTime) {
    console.error('Error: Bet timestamp is before sendTime');
    console.log(data);
    return NextResponse.json({error: "Bet timestamp is before sendTime"}, {status: 500 });
  }
  } else {
    return NextResponse.json({error: "No fill"}, {status: 500 });
  }

  console.log("Bet response", data)

  return NextResponse.json(data)
}