// Connect to my ganache testnet
import "./styles.css";
import "./display.css";

import React from "react";
import { ethers } from "ethers";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

const tokenABI = require("./abi/token.json");
const factoryABI = require("./abi/factory.json");
const routerABI = require("./abi/router.json");
const pairABI = require("./abi/pairs.json");

var ftm_main_url = "https://rpc.ftm.tools/";

let factory_address = {
  spooky: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
  spirit: "0xEF45d134b73241eDa7703fa787148D9C9F4950b0"
};

let router_address = {
  spooky: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
  spirit: "0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52"
};

let token_address = {
  FTM: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
  ETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  DAI: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
  LQDR: "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9",
  SPA: "0x5602df4a94eb6c680190accfa2a475621e0ddbdc"
};

const weth_address = ethers.utils.getAddress(token_address["FTM"]);
const weth_decimal = 18;

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    250, // Fantom main
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
    1337
  ]
});

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function get_connection() {
  //provider = new ethers.providers.Web3Provider(window.ethereum);
  const provider = new ethers.providers.JsonRpcProvider(ftm_main_url);
  return provider;
}

var conn = get_connection();

async function getPair(token0_address, token1_address, factory, conn) {
  try {
    const factory_contract = new ethers.Contract(factory, factoryABI, conn);
    const pair_address = await factory_contract.getPair(
      token0_address,
      token1_address
    );
    const pair_contract = new ethers.Contract(pair_address, pairABI, conn);
    if (pair_contract) {
      return { pair_address, token0_address, token1_address };
    }
  } catch (err) {
    console.log("Error obtaining pair contract or factory");
    let pair_address = "None";
    return { pair_address, token0_address, token1_address };
  }
}

const DisplayPair = ({ token0, token1, factory, conn }) => {
  const [pair, setPair] = React.useState(0);
  React.useEffect(() => {
    getPair(token_address[token0], token_address[token1], factory, conn).then(
      (pair) => {
        setPair(pair);
      }
    );
  }, [token0, token1, factory, conn]);
  return (
    <div>
      Pair: {token0} / {token1} <br />
      {"Pair Address:"} {pair.pair_address} <br />
    </div>
  );
};

export const Balance = () => {
  const { account, library } = useWeb3React();
  const [bal, setBal] = React.useState(0);

  React.useEffect(() => {
    // listen for changes on an Ethereum address
    console.log(`listening for blocks...`);
    library.on("block", () => {
      console.log("update balance...");
      console.log(balance);
      library.getBalance(account).then((bal) => {
        setBal(bal);
      });
    });
    // remove listener when the component is unmounted
    return () => {
      library.removeAllListeners("block");
    };
    // trigger the effect only on component mount
  }, []);

  if (!balance) {
    return (
      <div>
        ...
        {ethers.utils.formatEther(bal)}
      </div>
    );
  }
  return (
    <div>
      {" "}
      Ξ {parseFloat(ethers.utils.formatEther(balance)).toPrecision(4)} <br />
      {parseFloat(ethers.utils.formatEther(bal)).toPrecision(4)}
    </div>
  );
};

export const Wallet = () => {
  const { chainId, account, activate, active } = useWeb3React();

  const onClick = () => {
    console.log("Connecting");
    activate(injectedConnector);
  };

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      {active ? (
        <div>✅ </div>
      ) : (
        <button type="button" onClick={onClick}>
          Connect
        </button>
      )}
      {active && <Balance />}
    </div>
  );
};

export default function App() {
  const [isLit, setLit] = React.useState(false);
  //const [token0, setToken0] = React.useState("DAI");
  //const [token1, setToken1] = React.useState("FTM");
  //const [dex, setDex] = React.useState("spooky");
  const brightness = isLit ? "lit" : "dark";
  return (
    <div className={`App ${brightness}`}>
      <button onClick={() => setLit(!isLit)}>flip color</button>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Wallet />
      </Web3ReactProvider>
    </div>
  );
}
