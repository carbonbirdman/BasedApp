import "./styles.css";
import "./display.css";

import React from "react";
import { ethers } from "ethers";

const tokenABI = require("./abi/token.json");
const factoryABI = require("./abi/factory.json");
const routerABI = require("./abi/router.json");
const pairABI = require("./abi/pairs.json");

var rpc_url = "https://rpc.ftm.tools/";

const conn = new ethers.providers.JsonRpcProvider(rpc_url);
const pairAddress = "0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428";
const pairContract = new ethers.Contract(pairAddress, pairABI, conn);

export const DisplayEvent = ({ pairContract, conn }) => {
  const [event, setEvent] = React.useState({
    sender: "None",
    amount0In: "None",
    amount1In: "None",
    amount0Out: "None",
    amount1Out: "None",
    address: "None"
  });

  React.useEffect(() => {
    // listen for changes on an Ethereum address
    console.log(`listening...`);
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
    // trigger the effect only on component mount
  }, []);
  if (event.sender === "None") {
    return <div> ... Listening ...</div>;
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

export default function App() {
  const [isLit, setLit] = React.useState(false);
  const brightness = isLit ? "lit" : "dark";
  return (
    <div className={`App ${brightness}`}>
      <div align="left">
        Listen to FTM/DAI pair contract events on Spooky <br />
        <DisplayEvent pairContract={pairContract} conn={conn} />
      </div>
    </div>
  );
}
