import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  if (!requestData.marketId) {
    return NextResponse.json(
      { error: "No marketId provided" },
      { status: 400 }
    );
  }

  const chartData = await fetch(
    `https://insightprediction.com/markets/${requestData.marketId}/chartData?filters%5Bdate%5D=Market%20Duration`
  );
  if (!chartData.ok) {
    return NextResponse.json(
      {
        error: `Error fetching chart data: ${chartData.status} ${chartData.statusText}`,
      },
      { status: 500 }
    );
  }

  const { answers } = await chartData.json();

  // We only support single-choice markets for now

  const [choiceId] = Object.keys(answers);
  const { title } = answers[choiceId];

  const yesOrderBook = await fetch(
    `https://insightprediction.com/markets/${requestData.marketId}/orderbook?answer_type=yes&answer_id=${choiceId}`
  );
  if (!yesOrderBook.ok) {
    return NextResponse.json(
      {
        error: `Error fetching yes order book: ${yesOrderBook.status} ${yesOrderBook.statusText}`,
      },
      { status: 500 }
    );
  }

  // We want to buy YES, which means we want to buy the lowest SELL YES price
  const { sell: yesSellOrders } = await yesOrderBook.json();
  const lowestYesSellOrder = yesSellOrders[0];
  const buyYes = Number(lowestYesSellOrder.price.replace("\u00a2", "")) / 100;

  // Do the same for NO
  const noOrderBook = await fetch(
    `https://insightprediction.com/markets/${requestData.marketId}/orderbook?answer_type=no&answer_id=${choiceId}`
  );
  if (!noOrderBook.ok) {
    throw new Error(
      `Error fetching no order book: ${noOrderBook.status} ${noOrderBook.statusText}`
    );
  }

  // We want to buy NO, which means we want to buy the lowest SELL NO price
  const { sell: noSellOrders } = await noOrderBook.json();
  const lowestNoSellOrder = noSellOrders[0];
  const buyNo = Number(lowestNoSellOrder.price.replace("\u00a2", "")) / 100;

  return NextResponse.json({
    title,
    buyYes,
    buyNo,
  });
}
