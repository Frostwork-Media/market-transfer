const buyYes = (marketProbability, myProbability ) => {
    if(typeof marketProbability !== 'number' || typeof myProbability !== 'number')
        throw 'marketProbability and myProbability must be numbers';
    
    return marketProbability <= myProbability;
}

const marketWinChance = (marketProbability, buyYes) => {
    if(buyYes)  {
        return marketProbability;
    } else {
        return 1 - marketProbability;
    }
}

const myWinChance = (myProbability, buyYes) => {
    if(buyYes) {
        return myProbability;
    } else {
        return 1 - myProbability;
    }
}   

const marketReturn = (marketWinChance) => {
    return (1 - marketWinChance)/marketWinChance;
}

const kellyBetProportion = (marketReturn, myWinChance) => {
    return myWinChance - (1 - myWinChance)/marketReturn;
}

const kellyBet = (myBalance, kellyBetProportion) => {
    return myBalance * kellyBetProportion;
}

const betEVreturn = (marketWinChance, myWinChance) => {
    return myWinChance - marketWinChance
}

const betROI = (betEVreturn, marketWinChance) => {
    return betEVreturn/marketWinChance;
}

export default { 
    buyYes, 
    marketWinChance, 
    myWinChance, 
    marketReturn, 
    kellyBetProportion, 
    kellyBet, 
    betEVreturn, 
    betROI 
}