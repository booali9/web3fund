import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { contractABI, contractAddress } from '../web3/config';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const SUPPORTED_TESTNETS = {
  5: 'Goerli',
  11155111: 'Sepolia',
  80001: 'Mumbai',
  421613: 'Arbitrum Goerli',
  97: 'BNB Testnet'
};

export default function CreateCampaign() {
  const { provider, account, isActive, chainId } = useWeb3React();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageHash: '',
    goal: '',
    milestones: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [txHash, setTxHash] = useState('');
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const fetchUserCampaigns = async () => {
    if (!isActive || !account) return;
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const campaignIds = await contract.getUserCampaigns(account);
      const campaigns = [];
      
      for (const id of campaignIds) {
        const campaign = await contract.getCampaign(id);
        campaigns.push({
          id: id.toString(),
          title: campaign.title,
          description: campaign.description,
          goal: ethers.formatEther(campaign.goalAmount),
          raised: ethers.formatEther(campaign.totalRaised),
          isActive: campaign.isActive,
          exists: campaign.exists
        });
      }
      
      setUserCampaigns(campaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load your campaigns');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.deleteCampaign(campaignId);
      await tx.wait();
      await fetchUserCampaigns();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawFunds = async (campaignId) => {
    if (!window.confirm('Are you sure you want to withdraw all funds from this campaign?')) return;
    
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.withdrawFunds(campaignId);
      await tx.wait();
      await fetchUserCampaigns();
      setError('Funds withdrawn successfully!');
    } catch (err) {
      console.error('Withdraw failed:', err);
      if (err.message.includes("No funds to withdraw")) {
        setError('No funds available to withdraw');
      } else if (err.message.includes("Failed to send Ether")) {
        setError('Transfer failed. Please try again.');
      } else if (err.message.includes("onlyCampaignOwner")) {
        setError('Only the campaign owner can withdraw funds');
      } else {
        setError('Withdrawal failed: ' + (err.reason || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to stop this campaign?')) return;
    
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.stopCampaign(campaignId);
      await tx.wait();
      await fetchUserCampaigns();
    } catch (err) {
      console.error('Stop failed:', err);
      setError(err.message || 'Failed to stop campaign');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chainId) {
      if (SUPPORTED_TESTNETS[chainId]) {
        setNetworkName(SUPPORTED_TESTNETS[chainId]);
        setError('');
      } else {
        setNetworkName('Unsupported Network');
        setError(`Please switch to a testnet (${Object.values(SUPPORTED_TESTNETS).join(', ')})`);
      }
    } else {
      setNetworkName('Network not detected');
    }
    
    if (isActive) {
      fetchUserCampaigns();
    }
  }, [isActive, chainId, account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      if (!isActive || !account) throw new Error('Wallet not connected');
      if (!provider) throw new Error('Web3 provider not available');
      if (!SUPPORTED_TESTNETS[chainId]) throw new Error('Unsupported network');

      const milestones = form.milestones.split(',')
        .map(m => {
          const amount = m.trim();
          if (!amount || isNaN(amount) || Number(amount) <= 0) {
            throw new Error('Milestones must be positive numbers separated by commas');
          }
          return ethers.parseEther(amount);
        });

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.createCampaign(
        form.title,
        form.description,
        form.imageHash,
        ethers.parseEther(form.goal),
        milestones,
        { gasLimit: 1000000 }
      );

      setTxHash(tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        navigate('/', { 
          state: { 
            txSuccess: true,
            txHash: tx.hash,
            explorerUrl: `https://${chainId === 5 ? 'goerli.' : ''}etherscan.io/tx/${tx.hash}`
          } 
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err.message || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with animated tabs */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Campaign Dashboard
          </h1>
          
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium text-sm md:text-base transition-all duration-300 ${activeTab === 'create' ? 
                'text-indigo-400 border-b-2 border-indigo-400' : 
                'text-gray-400 hover:text-gray-300'}`}
            >
              Create Campaign
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 font-medium text-sm md:text-base transition-all duration-300 ${activeTab === 'manage' ? 
                'text-indigo-400 border-b-2 border-indigo-400' : 
                'text-gray-400 hover:text-gray-300'}`}
            >
              Manage Campaigns
            </button>
          </div>
        </div>

        {/* Network status */}
        <div className={`mb-6 p-3 rounded-lg ${SUPPORTED_TESTNETS[chainId] ? 
          'bg-indigo-900/30 text-indigo-400' : 
          'bg-red-900/30 text-red-400'} flex items-center`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {isActive ? (
            <>
              Connected to: {networkName}
              {account && (
                <span className="ml-2 text-gray-300">
                  ({`${account.substring(0, 6)}...${account.substring(38)}`})
                </span>
              )}
            </>
          ) : (
            'Please connect your wallet'
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Title *</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g. Build a community center"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                  <textarea
                    name="description"
                    placeholder="Tell people about your project..."
                    value={form.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">IPFS Image Hash *</label>
                  <input
                    name="imageHash"
                    type="text"
                    placeholder="QmXYZ..."
                    value={form.imageHash}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-400">Upload your image to IPFS first (try Pinata or Web3.Storage)</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Funding Goal (ETH) *</label>
                  <div className="relative">
                    <input
                      name="goal"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10"
                      value={form.goal}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                    />
                    <span className="absolute right-4 top-3 text-gray-400">ETH</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Milestones (ETH) *</label>
                  <input
                    name="milestones"
                    type="text"
                    placeholder="e.g. 2, 5, 10"
                    value={form.milestones}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-400">Amounts when funds can be partially withdrawn (comma separated)</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Campaign Tips
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Use clear, descriptive titles and descriptions</li>
                    <li>• Set realistic funding goals</li>
                    <li>• Break down your project into meaningful milestones</li>
                    <li>• High-quality images perform better</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading || !isActive || !SUPPORTED_TESTNETS[chainId]}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${(!isActive || !SUPPORTED_TESTNETS[chainId]) ? 
                  'bg-gray-700 text-gray-400 cursor-not-allowed' : 
                  'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/30'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Campaign...
                  </div>
                ) : (
                  SUPPORTED_TESTNETS[chainId] ? 'Launch Campaign' : 'Unsupported Network'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {userCampaigns.length === 0 ? (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Campaigns Found</h3>
                <p className="text-gray-500 mb-6">You haven't created any campaigns yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {userCampaigns.map(campaign => (
                  <li key={campaign.id} className="p-6 hover:bg-gray-700/30 transition-colors duration-200">
                    <div className="md:flex md:items-center md:justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-white truncate">{campaign.title}</h3>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{campaign.description}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <span className="font-medium">{campaign.raised} ETH</span>
                            <span className="mx-1 text-gray-500">raised of</span>
                            <span className="font-medium">{campaign.goal} ETH</span>
                          </div>
                          
                          <div className={`px-2 py-1 text-xs rounded-full ${campaign.isActive ? 
                            'bg-green-900/30 text-green-400' : 
                            'bg-gray-700 text-gray-400'}`}
                          >
                            {campaign.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex space-x-2">
                        {campaign.isActive && (
                          <>
                            <button
                              onClick={() => handleStopCampaign(campaign.id)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                            >
                              Stop
                            </button>
                            <button
                              onClick={() => handleWithdrawFunds(campaign.id)}
                              disabled={parseFloat(campaign.raised) <= 0}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${parseFloat(campaign.raised) > 0 ? 
                                'bg-indigo-600 hover:bg-indigo-700 text-white' : 
                                'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          disabled={!campaign.exists}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${campaign.exists ? 
                            'bg-red-600 hover:bg-red-700 text-white' : 
                            'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                          {campaign.exists ? 'Delete' : 'Deleted'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}