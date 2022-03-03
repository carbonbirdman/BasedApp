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
const pairAddress = "0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428";

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    250, // Fantom main
    4, // Rinkeby
    5, // Goerli
    42 // Kovan
  ]
});

var pairContract = "None";
var rpc_url = "https://rpc.ftm.tools/";
//const conn = new ethers.providers.JsonRpcProvider(rpc_url);
//pairContract = new ethers.Contract(pairAddress, pairABI, conn);

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 1200;
  return library;
}

export const DisplayEvent = ({ conn }) => {
  const [event, setEvent] = React.useState({
    sender: "None",
    amount0In: "None",
    amount1In: "None",
    amount0Out: "None",
    amount1Out: "None",
    address: "None"
  });
  const [contract, setContract] = React.useState("None");
  const { account, library } = useWeb3React();
  if (contract === "None") {
    pairContract = new ethers.Contract(pairAddress, pairABI, library);
    setContract(pairContract);
  }
  console.log(conn);
  console.log(library);
  React.useEffect(() => {
    // listen for changes on an Ethereum address
    console.log(`listening... useeffect`);
    //if (contract === "None") {
    //  return <div> ... Listening ...</div>;
    //} else {
    pairContract.on(
      "Swap",
      (sender, amount0In, amount1In, amount0Out, amount1Out, address) => {
        console.log("Swap detected sender", sender);
        var return_object = {
          sender,
          amount0In,
          amount1In,
          amount0Out,
          amount1Out,
          address
        };
        console.log(return_object);
        setEvent(return_object);
        return return_object;
      }
    );
    // remove listener when the component is unmounted
    return () => {
      pairContract.removeAllListeners("Swap");
    };
    // }
    // trigger the effect only on component mount
  }, []);
  if (event.sender === "None") {
    return <div> ... Listening, nothing yet ...</div>;
  }
  return (
    <div>
      {" "}
      {"Event detected"} <br />
      {"FTM in: "}
      {parseFloat(ethers.utils.formatEther(event.amount0In)).toPrecision(4)}
      <br />
      {"DAI out: "}
      {parseFloat(ethers.utils.formatEther(event.amount1Out)).toPrecision(
        4
      )}{" "}
      <br />
      {"Sender:"}
      {event.sender}
    </div>
  );
};

export const Wallet = () => {
  const { chainId, active, account, connector, activate } = useWeb3React();
  //const { chainId, account, activate, active } = useWeb3React();

  const onClick = () => {
    console.log("Connecting");
    activate(injectedConnector);
  };

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      {active ? (
        <div>{active && <DisplayEvent conn={connector} />}</div>
      ) : (
        <button type="button" onClick={onClick}>
          Connect
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [isLit, setLit] = React.useState(false);
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
