import { Web3ReactProvider, initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Web3Provider } from '@ethersproject/providers';

function getLibrary(provider) {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 15000;
  return library;
}

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);

export default function Web3ContextProvider({ children }) {
  return (
    <Web3ReactProvider 
      connectors={[[metaMask, hooks]]}
      getLibrary={getLibrary}
    >
      {children}
    </Web3ReactProvider>
  );
}