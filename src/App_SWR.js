//SWR update

import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import useSWR from "swr";

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    250, // Fantom main
    4, // Rinkeby
    5, // Goerli
    42 // Kovan
  ]
});

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const fetcher = (library) => (...args) => {
  const [method, ...params] = args;
  console.log(method, params);
  return library[method](...params);
};

export const SimpleBalance = () => {
  const { account, library } = useWeb3React();
  const { data: balance } = useSWR(["getBalance", account], {
    fetcher: fetcher(library)
  });
  if (!balance) {
    return <div>...</div>;
  }
  return <div>Balance: {balance.toString()}</div>;
};

export const Balance = () => {
  const { account, library } = useWeb3React();
  const [bal, setBal] = React.useState(0);
  const { data: balance, mutate } = useSWR(["getBalance", account], {
    fetcher: fetcher(library)
  });
  React.useEffect(() => {
    // listen for changes on an Ethereum address
    console.log(`listening for blocks...`);
    library.on("block", () => {
      console.log("update balance...");
      console.log(balance);
      mutate(undefined, true);
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
  return (
    <div>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Wallet />
      </Web3ReactProvider>
    </div>
  );
}
