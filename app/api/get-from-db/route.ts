import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.question.findMany();    
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}