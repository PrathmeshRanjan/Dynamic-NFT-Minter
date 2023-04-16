const networkConfig = {
  default: {
    name: "hardhat",
    fee: "100000000000000000",
    keyHash:
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000",
  },
  31337: {
    name: "localhost",
    fee: "100000000000000000",
    keyHash:
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000",
  },
  1: {
    name: "mainnet",
    linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
    fundAmount: "0",
  },
  11155111: {
    name: "sepolia",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    fee: "1000000000000000000",
    fundAmount: "10000000000000000000",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

const developmentChains = ["hardhat", "localhost"];

const getNetworkIdFromName = async (networkIdName) => {
  for (const id in networkConfig) {
    if (networkConfig[id]["name"] == networkIdName) {
      return id;
    }
  }
  return null;
};

const autoFundCheck = async (
  contractAddr,
  networkName,
  linkTokenAddress,
  additionalMessage
) => {
  const chainId = await getChainId();
  console.log("Checking to see if contract can be auto-funded with LINK:");
  const amount = networkConfig[chainId]["fundAmount"];
  //check to see if user has enough LINK
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const LinkToken = await ethers.getContractFactory("LinkToken");
  const linkTokenContract = new ethers.Contract(
    linkTokenAddress,
    LinkToken.interface,
    signer
  );
  const balanceHex = await linkTokenContract.balanceOf(signer.address);
  const balance = await web3.utils.toBN(balanceHex._hex).toString();
  const contractBalanceHex = await linkTokenContract.balanceOf(contractAddr);
  const contractBalance = await web3.utils
    .toBN(contractBalanceHex._hex)
    .toString();
  if (balance > amount && amount > 0 && contractBalance < amount) {
    //user has enough LINK to auto-fund
    //and the contract isn't already funded
    return true;
  } else {
    //user doesn't have enough LINK, print a warning
    console.log(
      "Account doesn't have enough LINK to fund contracts, or you're deploying to a network where auto funding isnt' done by default"
    );
    console.log(
      "Please obtain LINK via the faucet at https://" +
        networkName +
        ".chain.link/, then run the following command to fund contract with LINK:"
    );
    console.log(
      "npx hardhat fund-link --contract " +
        contractAddr +
        " --network " +
        networkName +
        additionalMessage
    );
    return false;
  }
};

module.exports = {
  networkConfig,
  getNetworkIdFromName,
  autoFundCheck,
  developmentChains,
};
