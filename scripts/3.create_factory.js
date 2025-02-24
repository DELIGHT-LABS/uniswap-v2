const { ethers } = require('hardhat');

async function main() {
  const { getSigners, getContractFactory } = ethers;
  const [signer] = await getSigners();
  const { address } = signer;

  // get factory contract
  const factoryContract = await getContractFactory('UniswapV2Factory');
  // deploy factory contract
  const factory = await factoryContract.deploy(address);
  const factoryContractAddress = await factory.getAddress();
  console.log('Contract deployed to:', factoryContractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
