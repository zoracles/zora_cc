const { default: BigNumber } = require("bignumber.js");
const { currentUnixTimestamp } = require("./time");
const { getFullDetail } = require('./zerion');
const { getDefiInfo } = require('./defiSDK');
const { getTotalBlocksNumber, getTotalEth, getGweiRating,
     getAgeRating, getNonceRating, getTotalGasSpent, getAssetRating,
     getEtherRating, getBscRating, getUniswapRating, getSushiRating,
     getZoraRating, getCompoundRating, getYFIRating,
     getPickleRating, getWBTCRating, getCoverRating, getAaveRating } = require('./getRating');

const getAccountMainInfo = (account) => {
    return new Promise(async (resolve) => {
        let totalEthIn = new BigNumber(0);
        let totalEthOut = new BigNumber(0);
        let maxGwei = new BigNumber(0);
        let totalGasSpent = new BigNumber(0);
        let maxNonce = 0;
        const info = await getFullDetail(account);
        const transactions = info.transactions;
        if (transactions.length == 0) {
            return resolve({ rating : 0, age: 0, maxNonce: 0, maxGwei: 0, totalGasSpent: 0, extra: null });
        }
        const firstTxBlock = transactions[0].blockNumber;
        const lastTxBlock = transactions[transactions.length - 1].blockNumber;
        const totalBlocks = Number(lastTxBlock) - Number(firstTxBlock);
        // console.log(transactions[transactions.length - 1])
        for (let i = 0; i < transactions.length; i++) {
            if (
                transactions[i].status === 'confirmed' &&
                transactions[i].contract === null &&
                transactions[i].address_from !== "" &&
                transactions[i].address_to !== ""
            ) {
                if (
                    transactions[i].address_to.toLowerCase() ===
                    account.toLowerCase()
                ) {
                    totalEthIn = totalEthIn.plus(
                        new BigNumber(transactions[i].value)
                    );
                } else {
                    totalEthOut = totalEthOut.plus(
                        new BigNumber(transactions[i].value)
                    );
                }
            }

            if (
                transactions[i].address_from.toLowerCase() === account.toLowerCase() &&
                transactions[i].status === 'confirmed'
            ) {
                if (maxNonce < transactions[i].nonce) {
                    maxNonce = transactions[i].nonce
                }
                if (transactions[i].fee) {
                    const fee = transactions[i].fee;
                    if (maxGwei.comparedTo(new BigNumber(fee.value).multipliedBy(new BigNumber(fee.price))) < 0) {
                        maxGwei = new BigNumber(fee.value).multipliedBy(new BigNumber(fee.price))
                    }
                    totalGasSpent = totalGasSpent.plus(new BigNumber(fee.value)
                        .multipliedBy(new BigNumber(fee.price))
                        .div(new BigNumber(10).pow(21)))
                }
            }

            if (i === transactions.length - 1) {
                const maxGweiNumber = new Number(maxGwei.dividedBy(new BigNumber(10).pow(16)))
                let age = getAccountAge(transactions[0]);
                // getDefiInfo();

                const rating = calculateRating(
                    totalEthIn,
                    totalEthOut,
                    Number(totalBlocks),
                    maxGweiNumber,
                    age,
                    maxNonce,
                    Number(totalGasSpent),
                    info.portfolio.total_value,
                    info.max,
                    info.portfolio.bsc_assets_value,
                    info.eth,                    
                    info.uniswap,
                    info.sushi,
                    info.zora,
                    info.comp,
                    info.yfi,
                    info.pickle,
                    info.wbtc,
                    info.cover,
                    info.aave
                );
                delete info.transactions;
                resolve({ rating, age, maxNonce, maxGwei: maxGweiNumber, totalGasSpent: Number(totalGasSpent), extra: info });
            }
        }
    });
};

const calculateRating = (
    totalEthIn,
    totalEthOut,
    totalBlocks,
    maxGwei,
    age,
    maxNonce,
    totalGasSpent,
    totalValue,
    maxValue,
    bscValue,
    ethValue,
    uniswap,
    sushi,
    zora,
    comp,
    yfi,
    pickle,
    wbtc,
    cover,
    aave) => {
    let rating = getTotalBlocksNumber(totalBlocks); // 70
    rating += getTotalEth(totalEthIn, totalEthOut); // 30
    rating += getGweiRating(maxGwei); // 50
    rating += getAgeRating(age); // 40
    rating += getNonceRating(maxNonce); // 40
    rating += getTotalGasSpent(totalGasSpent); // 50
    rating += getAssetRating(totalValue, maxValue); // 50
    rating += getEtherRating(ethValue); // 30
    rating += getBscRating(bscValue); // 20
    rating += getUniswapRating(uniswap.sent + uniswap.received + uniswap.trading); //30
    rating += getSushiRating(sushi.sent + sushi.received + sushi.trading) // 30
    rating += getZoraRating(zora.sent + zora.received + zora.trading) // 100
    rating += getCompoundRating(comp.sent + comp.received + comp.trading) // 15
    rating += getYFIRating(yfi.sent + yfi.received + yfi.trading) // 60
    rating += getPickleRating(pickle.sent + pickle.received + pickle.trading) // 50
    rating += getWBTCRating(wbtc.sent + wbtc.received + wbtc.trading) // 20
    rating += getCoverRating(cover.sent + cover.received + cover.trading) // 65
    rating += getAaveRating(aave.sent + aave.received + aave.trading) // 50
    return rating.toFixed(2);
};
const getAccountAge = (firstTx) => {
    const txTimestamp = Number(firstTx.mined_at);
    const timeDiff = currentUnixTimestamp() - txTimestamp;
    const age = Math.floor(timeDiff / (60 * 60 * 24));
    return age;
};

module.exports = { getAccountMainInfo };
