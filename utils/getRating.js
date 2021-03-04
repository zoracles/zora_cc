const { default: BigNumber } = require("bignumber.js");

const getNumberByRange = (score, range, numbers) => {
	for (let i = 0; i < range.length; i++) {
		if (score < range[i]) {
			return numbers[i]
		}
	}
	return numbers[numbers.length - 1];
}

const getTotalBlocksNumber = (totalBlocks) => { // max is 70
	let rating = 0;

  	if (totalBlocks <= 200) {
        rating += 0;
    } else if (totalBlocks > 200 && totalBlocks <= 1000) {
        rating += 6 * (totalBlocks / 1000);
    } else if (totalBlocks > 1000 && totalBlocks <= 10000) {
        rating += 6 + (6 * (totalBlocks / 10000))
    } else if (totalBlocks > 10000 && totalBlocks <= 100000) {
        rating += 12 + (6 * (totalBlocks / 100000))
    } else if (totalBlocks > 100000 && totalBlocks <= 1000000) {
        rating += 20 + (12 * (totalBlocks / 1000000))
    } else if (totalBlocks > 1000000 && totalBlocks <= 10000000) {
        rating += 32 + (13 * (totalBlocks / 10000000))
    } else if (totalBlocks > 10000000 && totalBlocks <= 100000000) {
        rating += 45 + (13 * (totalBlocks / 100000000))
    } else if (totalBlocks > 100000000 && totalBlocks <= 1000000000) {
        rating += 58 + (12 * (totalBlocks / 1000000000))
    } else if (totalBlocks > 1000000000) {
        rating += 70;
    }

	return rating;
}

const getTotalEth = (totalEthIn, totalEthOut) => { // max is 30
	let rating = 0;
	const avgEth = totalEthIn.minus(totalEthOut);
    const avgEthLength = avgEth.e + 1;

    const variableRating = Number(
        new BigNumber(10).multipliedBy(
            avgEth.dividedBy(
                new BigNumber(10).pow(
                    new BigNumber(avgEthLength)
                )
            )
        )
    );

    if (avgEthLength < 15) {
        rating += 0;
    } else if (avgEthLength >= 15 && avgEthLength < 17) {
        rating += 0 + variableRating;
    } else if (avgEthLength >= 17 && avgEthLength < 20) {
        rating += 10 + variableRating;
    } else if (avgEthLength >= 20 && avgEthLength < 22) {
        rating += 20 + variableRating;
    } else if (avgEthLength >= 22) {
        rating += 30;
    }

	return rating;
}

const getGweiRating = (gwei) => { // max is 50
	return getNumberByRange(
		gwei,
		[200, 300, 400, 500, 600, 700, 800, 900],
		[10, 15, 20, 25, 30, 35, 40, 45, 50]
	);
}

const getAgeRating = (age) => {
	return getNumberByRange(
		age,
		[60, 120, 240, 360, 720, 1080],
		[10, 15, 20, 25, 30, 35, 40]
	);
}

const getNonceRating = (nonce) => {
	return getNumberByRange(
		nonce,
		[100, 200, 400, 600, 800, 1000, 1500, 2000],
		[10, 15, 20, 25, 30, 35, 40, 45, 50]
	);
}

const getTotalGasSpent = (gasSpent) => {
	return getNumberByRange(
		gasSpent,
		[1, 2, 3, 4, 5, 6, 7, 8, 9],
		[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
	);
}

module.exports = { getTotalBlocksNumber, getTotalEth, getGweiRating, getAgeRating, getNonceRating, getTotalGasSpent }