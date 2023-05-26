import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

import prisma from '../../../lib/prisma';
// NEED TO USE API PAGE ROUTE DUE TO CORS LIMITATIONS ON CLIENT SIDE

export async function POST(
    req: NextApiRequest,
) {
    const questionData = req.body;
    console.log(questionData)

    try {
        const newQuestion = await prisma.question.create({
            data: {
                title: questionData.title,
                url: questionData.url,
                marketProbability: questionData.marketProbability,
                userProbability: questionData.userProbability,
                marketCorrectionTime: questionData.marketCorrectionTime,
                rOI: questionData.rOI,
                aggregator: 'MANIFOLD',
                broadQuestionId: questionData.broadQuestionId,
            }
        })
        
        return NextResponse.json(newQuestion)
    } catch (err) {
        console.log(err)
        return NextResponse.error()
    }
}