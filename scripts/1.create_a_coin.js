const { ethers } = require('hardhat');

async function main() {
  const { getSigners, getContractFactory } = ethers;
  const [signer] = await getSigners();
  const { address } = signer;
  console.log('Deploying contract with the account:', address);

  const contract = await getContractFactory('AC');
  const token = await contract.deploy();
  console.log('Contract deployed to:', await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
