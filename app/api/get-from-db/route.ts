import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
// NEED TO USE API PAGE ROUTE DUE TO CORS LIMITATIONS ON CLIENT SIDE

export async function POST(request: Request) {

    const test = await prisma.test.findFirst({
        where: {
            name: "test"
        }
    })

    console.log(test)

    return NextResponse.json(test)
}