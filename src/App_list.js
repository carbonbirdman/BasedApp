import "./styles.css";
import "./display.css";

import React from "react";
import { ethers } from "ethers";

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

function get_connection() {
  //provider = new ethers.providers.Web3Provider(window.ethereum);
  const provider = new ethers.providers.JsonRpcProvider(ftm_main_url);
  return provider;
}

var conn = get_connection();
const eth_in = "1";

const DisplayObj = ({ conn }) => {
  const [items, setItems] = React.useState(0);
  let swap_requests = [
    {
      eth_in: eth_in,
      dex_ask: "spirit",
      dex_bid: "spooky",
      token0_symbol: "FTM",
      token1_symbol: "WBTC",
      token0_address: token_address["FTM"],
      token1_address: token_address["WBTC"],
      conn
    },
    {
      eth_in: eth_in,
      dex_ask: "spirit",
      dex_bid: "spooky",
      token0_symbol: "FTM",
      token1_symbol: "ETH",
      token0_address: token_address["FTM"],
      token1_address: token_address["ETH"],
      conn
    }
  ];

  React.useEffect(() => {
    setItems(swap_requests);
    console.log(swap_requests);
  });
  if (items !== 0) {
    return (
      <div>
        {" "}
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item.dex_ask}</li>
          ))}
        </ul>
      </div>
    );
  }
  return <div>{".."}</div>;
};

const DisplayList = ({ conn }) => {
  const [items, setItems] = React.useState(0);
  const tokens = [
    "LQDR",
    "ETH",
    "DAI",
    "SPA",
    "WBTC",
    "ICE",
    "MIM",
    "CRV",
    "LINK",
    "SUSHI",
    "BIFI",
    "MIM",
    "ANY"
  ];
  React.useEffect(() => {
    setItems(tokens);
  });
  return (
    <div>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>{token}</li>
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
        <DisplayList conn={conn} />
        /<DisplayObj conn={conn} />
      </div>
    </div>
  );
}
