import { useWeb3React } from '@web3-react/core';
import { contractABI, contractAddress } from '../web3/config';
import { ethers } from 'ethers';

export default function useWeb3() {
  const { provider, account, chainId } = useWeb3React();

  const getContract = () => {
    if (!provider || !account) return null;
    const signer = provider.getSigner();
    return new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
  };

  const switchNetwork = async (chainId) => {
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: `0x${chainId.toString(16)}` }]);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  return {
    getContract,
    switchNetwork,
    account,
    chainId
  };
}