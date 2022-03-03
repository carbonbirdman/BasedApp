import "./styles.css";
import "./display.css";

import React from "react";
import { ethers } from "ethers";

const tokenABI = require("./abi/token.json");
const factoryABI = require("./abi/factory.json");
const routerABI = require("./abi/router.json");
const pairABI = require("./abi/pairs.json");

var rpc_url = "https://rpc.ftm.tools/";

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

const Web3 = require("web3");
const web3 = new Web3(
  "https://apis.ankr.com/300a0d7f15fc4a01b79ff1bd778088d7/45614406b1e8e84a919cc03be771db24/fantom/full/main"
);

const conn = new ethers.providers.JsonRpcProvider(rpc_url);

async function getPair(token0_address, token1_address, factory, conn) {
  const factory_contract = new ethers.Contract(factory, factoryABI, conn);
  const pair_address = await factory_contract.getPair(
    token0_address,
    token1_address
  );
  const pair_contract = new ethers.Contract(pair_address, pairABI, conn);
  if (pair_contract) {
    console.log(pair_contract);
    return { contract: pair_contract, address: pair_address };
  } else {
    console.log("Error obtaining pair contract");
    return { contract: "None", address: "None" };
  }
}

const DisplayPair = ({ token0, token1, factory, conn }) => {
  const [pair, setPair] = React.useState(0);
  React.useEffect(() => {
    getPair(token_address[token0], token_address[token1], factory, conn).then(
      (pair) => {
        setPair(pair.address);
      }
    );
  }, [token0, token1, factory, conn]);
  return (
    <div>
      Pair: {token0} / {token1} <br />
      {"Pair Contract:"} {pair} <br />
    </div>
  );
};

const threshold = 100 * 10 ** 18;
async function getPast(token0_address, token1_address, factory, conn) {
  try {
    const factory_contract = new ethers.Contract(factory, factoryABI, conn);
    const pairAddress = await factory_contract.getPair(
      token0_address,
      token1_address
    );
    const myContract = new web3.eth.Contract(pairABI, pairAddress);
    const blocknum = await web3.eth.getBlockNumber(); //.then((blocknum) => {
    console.log("BLOCKNUMS");
    console.log(blocknum);
    let options = {
      //  filter: {
      //      value: ['1000', '1337']
      //  },    //Only get events where transfer value was 1000 or 1337
      fromBlock: blocknum - 500,
      toBlock: "latest" //,
      //topics: [Array]
    };
    try {
      const results = await myContract.getPastEvents("Swap", options);
      console.log("RESULTS");
      console.log(results);
      return results;
    } catch (err) {
      return "...er...";
    }
  } catch (err) {
    console.log("Error obtaining contract");
    return "...err...";
  }
}

const DisplayPast = ({ token0, token1, factory, conn }) => {
  const [past, setPast] = React.useState(0);
  React.useEffect(() => {
    getPast(token_address[token0], token_address[token1], factory, conn).then(
      (pastin) => {
        console.log("set");
        console.log(pastin);
        setPast(pastin);
      }
    );
  }, [token0, token1, factory, conn]);
  if (past === 0) {
    return <div> ... Waiting ...</div>;
  }
  if (past === "...err...") {
    return <div> ... Waiting ...</div>;
  }
  if (past === "...er...") {
    return <div> ... What? ...</div>;
  }
  return (
    <div>
      {" "}
      <ul>
        {past.map((item, index) => (
          <li key={index}>{item.transactionHash}</li>
        ))}
      </ul>
    </div>
  );
};

export default function App() {
  const [isLit, setLit] = React.useState(false);
  const [token0, setToken0] = React.useState("DAI");
  const [token1, setToken1] = React.useState("FTM");
  const [dex, setDex] = React.useState("spooky");
  const brightness = isLit ? "lit" : "dark";
  return (
    <div className={`App ${brightness}`}>
      <div align="left">
        Displays token prices, FTM pools only. Color {isLit ? "lit" : "dark"}
        <button onClick={() => setLit(!isLit)}>flip color</button>
        <br /> Token0:
        <button onClick={() => setToken0("SPA")}>SPA</button>
        <button onClick={() => setToken0("DAI")}>DAI</button>
        <button onClick={() => setToken0("LQDR")}>LQDR</button>
        <br /> Dex:
        <button onClick={() => setDex("spooky")}>Spooky</button>
        <button onClick={() => setDex("spirit")}>Spirit</button>
        <br />
        <br />
        <DisplayPair
          token0={token0}
          token1={token1}
          factory={factory_address[dex]}
          conn={conn}
        />
        <br />
        <DisplayPast
          token0={token0}
          token1={token1}
          factory={factory_address[dex]}
          conn={conn}
        />
      </div>
    </div>
  );
}
