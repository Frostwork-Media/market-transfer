const buyYes = (marketProbability, myProbability ) => {
    if(typeof marketProbability !== 'number' || typeof myProbability !== 'number')
        throw 'marketProbability and myProbability must be numbers';
    
    return marketProbability >= myProbability;
}

const myWinChance = (marketProbability, buyYes) => {
    if(buyYes)  {
        return marketProbability;
    } else {
        return 1 - marketProbability;
    }
}