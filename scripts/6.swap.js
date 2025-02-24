const { ethers } = require('hardhat');

const overrides = {
  gasLimit: 9999999,
};

async function report(connectedTokenA, connectedTokenB, connectedPair, address) {
  console.log(`
    signer
    A balance: ${await connectedTokenA.balanceOf(address)}
    B balance: ${await connectedTokenB.balanceOf(address)}

    pair
    A balance: ${await connectedTokenA.balanceOf(connectedPair.target)}
    B balance: ${await connectedTokenB.balanceOf(connectedPair.target)}
  `);
}

async function reportKAndReserve({ kLast, getReserves }, swapped = false) {
  // get k
  const k = await kLast();
  // get amount of tokens
  const [r0, r1] = await getReserves();

  console.log(`
    K = ${k}

    amount of A : ${!swapped ? r0 : r1}
    amount of B : ${!swapped ? r1 : r0}
  `);
}

async function reportLP(pair, address) {
  console.log(`
    signer

    LP token: ${await pair.balanceOf(address)}
  `);
}

async function main() {
  const { getSigners, getContractFactory } = ethers;
  const [signer] = await getSigners();
  const { address } = signer;

  const coinContract = await getContractFactory('UniswapV2ERC20');
  const pairContract = await getContractFactory('UniswapV2Pair');

  const AcoinAddress = 'a_coin_address';
  const BcoinAddress = 'b_coin_address';
  const pairAddress = 'pair_contract_address';

  const swapped = AcoinAddress > BcoinAddress;

  const Acoin = coinContract.attach(AcoinAddress).connect(signer);
  const Bcoin = coinContract.attach(BcoinAddress).connect(signer);
  const pair = pairContract.attach(pairAddress).connect(signer);

  const { transfer } = Acoin;
  const { swap, getReserves, kLast } = pair;

  console.log('=== Before Swap ===');
  await report(Acoin, Bcoin, pair, address);
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);

  // send A coin from A coin to pair
  const wantToSwap = 1000;
  const k = await kLast();
  const [r0, r1] = await getReserves();
  const [reserveAcoin, reserveBcoin] = !swapped ? [r0, r1] : [r1, r0];

  const amountIn = wantToSwap;
  const denominator = Number(reserveBcoin) * 1000 + amountIn * 997;
  const amountOut = BigInt(parseInt(Number(reserveAcoin) - (Number(k) * 1000) / denominator));
  const minAmountOut = (amountOut * BigInt(995)) / BigInt(1000);

  const transferTx = await transfer(pair.target, wantToSwap);
  await transferTx.wait();

  const swapTx = await (swapped
    ? swap(minAmountOut, 0, address, '0x', overrides)
    : swap(0, minAmountOut, address, '0x', overrides));
  await swapTx.wait();

  console.log('=== After Swap ===');
  await report(Acoin, Bcoin, pair, address);
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
