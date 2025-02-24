const { ethers } = require('hardhat');

async function main() {
  const { getSigners, getContractFactory } = ethers;
  const [signer] = await getSigners();
  const { address } = signer;

  const coinContract = await getContractFactory('UniswapV2ERC20');
  const factoryContract = await getContractFactory('UniswapV2Factory');

  // check pair
  const AcoinAddress = 'a_coin_address';
  const BcoinAddress = 'b_coin_address';
  const factoryAddress = 'factory_contract_address';

  const Acoin = coinContract.attach(AcoinAddress).connect(signer);
  const Bcoin = coinContract.attach(BcoinAddress).connect(signer);
  const factory = factoryContract.attach(factoryAddress).connect(signer);

  const { getPair, createPair, setFeeTo } = factory;

  const pairContractAddress = await getPair(Acoin.target, Bcoin.target);

  if (pairContractAddress === '0x0000000000000000000000000000000000000000') {
    const createPairTx = await createPair(AcoinAddress, BcoinAddress);
    await createPairTx.wait();

    const setFeeToTx = await setFeeTo(address);
    await setFeeToTx.wait();
  }
  console.log(`Contract deployed to: ${await getPair(AcoinAddress, BcoinAddress)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
