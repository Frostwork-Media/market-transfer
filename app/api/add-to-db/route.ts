import { NextApiResponse,NextApiRequest } from 'next';
import prisma from '../../../lib/prisma';
// NEED TO USE API PAGE ROUTE DUE TO CORS LIMITATIONS ON CLIENT SIDE

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method === 'POST') {
      const questionData = req.body;
  
      const newQuestion = await prisma.question.create({
        data: {
          title: questionData.title,
          url: questionData.url,
          marketProbability: questionData.marketProbability,
          userProbability: questionData.userProbability,
          marketCorrectionTime: null,
          rOI: questionData.rOI,
          aggregator: 'MANIFOLD',
          broadQuestionId: null
        }
      })
  
      res.json(newQuestion)
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }