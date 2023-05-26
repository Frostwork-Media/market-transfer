import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
// NEED TO USE API PAGE ROUTE DUE TO CORS LIMITATIONS ON CLIENT SIDE

export async function GET(request: Request) {
    const questions = await prisma.question.findMany()
    
    console.log(questions)

    return NextResponse.json(questions)
}