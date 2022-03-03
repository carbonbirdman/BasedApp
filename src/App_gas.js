import "./styles.css";
import "./display.css";
import React from "react";
import { ethers } from "ethers";

const tokenABI = require("./abi/token.json");
const factoryABI = require("./abi/factory.json");
const routerABI = require("./abi/router.json");
const pairABI = require("./abi/pairs.json");

var ftm_main_url = "https://rpc.ftm.tools/";

const wallet = "0x831CEf5CC6d5ee48a8E33711c2AC70c5a6B30Cfb";

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

//owlracle.info/ftm/gas

async function getPair(token0_address, token1_address, factory, conn) {
  try {
    const factory_contract = new ethers.Contract(factory, factoryABI, conn);
    const router_contract = new ethers.Contract(
      router_address["spooky"],
      routerABI,
      conn
    );
    const pair_address = await factory_contract.getPair(
      token0_address,
      token1_address
    );
    const pair_contract = new ethers.Contract(pair_address, pairABI, conn);
    console.log(pair_contract);
    console.log(router_contract);
    // swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
    const amountIn = ethers.utils.parseEther("1");
    console.log(Date.now());
    const gas_estimate = await router_contract.estimateGas.swapExactTokensForTokens(
      amountIn,
      amountIn,
      [token0_address, token1_address],
      wallet,
      Date.now() + 1000 * 60 * 10,
      {
        gasPrice: conn.getGasPrice(),
        gasLimit: 310000,
        value: amountIn
      }
    );
    //buy_tx = router_contract.functions.swapExactTokensForTokens(
    //  amount_in,
    //  min_amount_out,
    //  [web3.toChecksumAddress(token_address_in),
    //   web3.toChecksumAddress(token_address_out)],
    //  wallet_address,
    //  deadline).buildTransaction({
    //  'gas': max_gas,
    //  'gasPrice': web3.toWei(gas_price, 'gwei'),
    //  'nonce': web3.eth.get_transaction_count(wallet_address),
    //})
    //signed_tx = web3.eth.account.sign_transaction(buy_tx, holy_key)
    //tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
    console.log(gas_estimate);
    const gasPrice = await conn.getGasPrice();
    console.log(gasPrice);
    if (pair_contract) {
      return { pair_address, token0_address, token1_address, gasPrice };
    }
  } catch (err) {
    console.log("Error obtaining pair contract or factory");
    let pair_address = "None";
    return pair_address;
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

export default function App() {
  const [isLit, setLit] = React.useState(false);
  const [token0, setToken0] = React.useState("DAI");
  const [token1, setToken1] = React.useState("FTM");
  const [dex, setDex] = React.useState("spooky");
  const brightness = isLit ? "lit" : "dark";
  return (
    <div className={`App ${brightness}`}>
      <div align="left">
        Gas required for a transaction Color {isLit ? "lit" : "dark"}
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
      </div>
    </div>
  );
}
