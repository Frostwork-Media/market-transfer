import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const questionsData = req.body;

    // Ensure the body contains an array of questions
    if (!Array.isArray(questionsData)) {
        return NextResponse.json({ error: 'Expected an array of questions in the request body.' });
    }

    try {
        // Wipe the `question` table
        await prisma.question.deleteMany();

        // Create new questions using the provided data
        const newQuestions = await prisma.question.createMany({
            data: questionsData
        });

        return NextResponse.json({ success: true, message: 'Questions replaced successfully.' });
    } catch (error) {
        console.error("Error replacing questions in the database:", error);
        throw error;
    }
}