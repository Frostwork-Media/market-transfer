import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const questionsData = await req.json();

  // Ensure the body contains an array of questions
  if (!Array.isArray(questionsData)) {
    return NextResponse.json({
      error: "Expected an array of questions in the request body.",
    });
  }

  try {
    await prisma.$transaction([
      // Wipe the `question` table
      prisma.question.deleteMany(),

      // Create new questions using the provided data
      prisma.question.createMany({
        data: questionsData.map((question) => ({
          slug: question.slug,
          url: question.url,
          userProbability: question.userProbability,
          marketCorrectionTime: question.marketCorrectionTime,
          aggregator: question.aggregator,
        })),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Questions replaced successfully.",
    });
  } catch (error) {
    console.error("Error replacing questions in the database:", error);
    throw error;
  }
}
