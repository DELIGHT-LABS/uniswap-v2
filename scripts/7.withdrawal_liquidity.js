const { ethers } = require('hardhat');

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

async function withdrawLiquidity(pair, amountLP, signerAddress) {
  const lpBalance = await pair.balanceOf(signerAddress);
  console.log(`Available LP balance: ${lpBalance}`);

  if (lpBalance < amountLP) {
    throw new Error(`Insufficient LP balance: ${lpBalance} < ${amountLP}`);
  }

  const transferTx = await pair.transfer(pair.target, amountLP);
  await transferTx.wait();
  console.log(`Transfer ${amountLP} LP tokens from signer(${signerAddress}) to pair(${pair.target}) for withdrawal`);

  const burnTx = await pair.burn(signerAddress);
  await burnTx.wait();
  console.log(`Withdrew liquidity, burned ${amountLP} LP tokens`);
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

  const Acoin = coinContract.attach(AcoinAddress).connect(signer);
  const Bcoin = coinContract.attach(BcoinAddress).connect(signer);
  const pair = pairContract.attach(pairAddress).connect(signer);

  const swapped = AcoinAddress > BcoinAddress;

  console.log('=== Before Withdrawal ===');
  await report(Acoin, Bcoin, pair, address);
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);

  console.log('=== Withdrawing Liquidity ===');
  const lpToWithdraw = 1000;
  await withdrawLiquidity(pair, lpToWithdraw, address);

  console.log('=== After Withdrawal ===');
  await report(Acoin, Bcoin, pair, address);
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
