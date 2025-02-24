const { ethers } = require('hardhat');

const overrides = {
  gasLimit: 9999999,
};

async function addLiquidity(connectedTokenA, connectedTokenB, connectedPair, address, tokenAAmount, tokenBAmount) {
  console.log('=== Provide Liquidity ===');
  console.log(`
    signer
    A balance: ${await connectedTokenA.balanceOf(address)}
    B balance: ${await connectedTokenB.balanceOf(address)}

    pair
    A balance: ${await connectedTokenA.balanceOf(connectedPair.target)}
    B balance: ${await connectedTokenB.balanceOf(connectedPair.target)}
  `);
  const transferATx = await connectedTokenA.transfer(connectedPair.target, tokenAAmount);
  await transferATx.wait();
  console.log(`
    signer
    A balance: ${await connectedTokenA.balanceOf(address)}
    B balance: ${await connectedTokenB.balanceOf(address)}

    pair
    A balance: ${await connectedTokenA.balanceOf(connectedPair.target)}
    B balance: ${await connectedTokenB.balanceOf(connectedPair.target)}
  `);
  const transferBTx = await connectedTokenB.transfer(connectedPair.target, tokenBAmount);
  await transferBTx.wait();
  console.log(`
    signer
    A balance: ${await connectedTokenA.balanceOf(address)}
    B balance: ${await connectedTokenB.balanceOf(address)}

    pair
    A balance: ${await connectedTokenA.balanceOf(connectedPair.target)}
    B balance: ${await connectedTokenB.balanceOf(connectedPair.target)}
  `);
  const mintTx = await connectedPair.mint(address, overrides);
  await mintTx.wait();
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

  console.log('=== Before Provide ===');
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);

  // provide liquidity
  await addLiquidity(Acoin, Bcoin, pair, address, 1_000_000, 1_000_000);

  console.log('=== After Provide ===');
  await reportKAndReserve(pair, swapped);
  await reportLP(pair, address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
