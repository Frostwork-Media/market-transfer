export const buyYes = (marketProbability, myProbability ) => {
    if(typeof marketProbability !== 'number' || typeof myProbability !== 'number')
        throw 'marketProbability and myProbability must be numbers';
    
    return marketProbability <= myProbability;
}

export const marketWinChance = (marketProbability, buyYes) => {
    if(buyYes)  {
        return marketProbability;
    } else {
        return 1 - marketProbability;
    }
}

export const myWinChance = (myProbability, buyYes) => {
    if(buyYes) {
        return myProbability;
    } else {
        return 1 - myProbability;
    }
}   

export const marketReturn = (marketWinChance) => {
    return (1 - marketWinChance)/marketWinChance;
}

export const kellyBetProportion = (marketReturn, myWinChance) => {
    return myWinChance - (1 - myWinChance)/marketReturn;
}

export const kellyBet = (myBalance, kellyBetProportion) => {
    return myBalance * kellyBetProportion;
}

export const betEVreturn = (marketWinChance, myWinChance) => {
    return myWinChance - marketWinChance
}

export const betROI = (betEVreturn, marketWinChance) => {
    return betEVreturn/marketWinChance;
}