import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

import prisma from '../../../lib/prisma';
// NEED TO USE API PAGE ROUTE DUE TO CORS LIMITATIONS ON CLIENT SIDE

export async function POST(
    req: NextApiRequest,
) {
    const questionData = req.body
    console.log("adding to db")
    console.log("question data:", questionData)

    try {
        const newQuestion = await prisma.question.create({
            data: {
                slug: questionData.title,
                url: questionData.url,
                userProbability: questionData.userProbability,
                marketCorrectionTime: questionData.marketCorrectionTime,
                aggregator: 'MANIFOLD',
                broadQuestionId: questionData.broadQuestionId,
            }
        })
        
        return NextResponse.json(newQuestion)
    } catch (err) {
        console.log("Database upload failure",err)
        return NextResponse.error()
    }
}