import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  if (!requestData.conditionId) {
    return NextResponse.json(
      { error: "No conditionId provided" },
      { status: 400 }
    );
  }

  const marketData = await fetch(
    `https://clob.polymarket.com/markets/${requestData.conditionId}`
  );
  if (!marketData.ok) {
    return NextResponse.json(
      {
        error: `Error fetching market data: ${marketData.status} ${marketData.statusText}`,
      },
      { status: 500 }
    );
  }

  const { question: title, market_slug: slug, tokens } = await marketData.json();
  
  // We only support single-choice markets for now

  const isBinaryMarket = tokens.every(token => ['No', 'Yes'].includes(token.outcome));

  if (!isBinaryMarket) {
    return NextResponse.json(
      {
        error: "Market doesn't look binary – please check the market options by running 'curl " + `https://clob.polymarket.com/markets/${requestData.conditionId}'`,
      },
      { status: 400 }
    )
  }

  // Find each token by pulling its ID from the tokens array and querying the API

  const yesToken = tokens.find(token => token.outcome === 'Yes');
  const noToken = tokens.find(token => token.outcome === 'No');
  if (!yesToken || !noToken) {
    throw new Error("Something very very very wrong has happened.")
  }

  const tokenUrl = "https://clob.polymarket.com/book?token_id\=";

  // We want to buy YES, which means we want to buy the lowest SELL YES price
  
  const yesTokenRequest = await fetch(tokenUrl + yesToken.token_id);
  if (!yesTokenRequest.ok) {
    return NextResponse.json(
      {
        error: "Error querying YES token"
      },
      { status: 500 }
    )
  }

  const yesr = await yesTokenRequest.json();
  const { asks: yesAsks } = yesr;
  const buyYes = yesAsks.reduce((lowest, currentAsk) => Number(currentAsk.price) < Number(lowest) ? Number(currentAsk.price) : Number(lowest), 1.0);

  // Do the same for NO

  const noTokenRequest = await fetch(tokenUrl + noToken.token_id);
  if (!noTokenRequest.ok) {
    return NextResponse.json(
      {
        error: "Error querying NO token"
      },
      { status: 500 }
    )
  }

  const r = await noTokenRequest.json();
  const { asks: noAsks } = r;
  const buyNo = noAsks.reduce((lowest, currentAsk) => Number(currentAsk.price) < Number(lowest) ? Number(currentAsk.price) : Number(lowest), 1.0);

  // Return the data

  return NextResponse.json({
    title,
    slug,
    buyYes,
    buyNo,
  });
}
