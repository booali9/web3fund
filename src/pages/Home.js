import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { contractABI, contractAddress } from '../web3/config';
import { ethers } from 'ethers';
import { Link, useLocation } from 'react-router-dom';

export default function Home() {
  const { account } = useWeb3React();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();

  const getEthersProvider = () => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error('No Ethereum provider found');
  };

  const loadCampaigns = async () => {
    setLoading(true);
    setError('');

    try {
      const ethersProvider = getEthersProvider();
      const signer = await ethersProvider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const campaignCount = Number(await contract.getCampaignCount());
      const loadedCampaigns = [];
      const BATCH_SIZE = 5;
      
      for (let i = 0; i < campaignCount; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE, campaignCount);
        
        const batchPromises = [];
        for (let j = i; j < batchEnd; j++) {
          batchPromises.push(
            contract.getCampaign(j)
              .then(data => ({
                id: j,
                data: {
                  owner: data[0],
                  title: data[1],
                  description: data[2],
                  imageHash: data[3],
                  goalAmount: data[4],
                  totalRaised: data[5],
                  isActive: data[6],
                  milestones: data[7],
                  currentMilestone: data[8],
                  exists: true
                }
              }))
              .catch(() => null)
          );
        }

        const batchResults = await Promise.all(batchPromises);
        
        for (const result of batchResults) {
          if (!result?.data?.isActive) continue;
          
          const { id, data } = result;
          loadedCampaigns.push({
            id: id.toString(),
            title: data.title,
            description: data.description,
            goal: ethers.formatEther(data.goalAmount),
            raised: ethers.formatEther(data.totalRaised),
            owner: data.owner,
            imageHash: data.imageHash,
            milestones: data.milestones.map(m => ethers.formatEther(m)),
            currentMilestone: Number(data.currentMilestone)
          });
        }
      }

      setCampaigns(loadedCampaigns);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 w-16 bg-indigo-500 rounded-full mb-4"></div>
        <p className="text-indigo-300 text-lg">Loading campaigns...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md text-center">
        <div className="text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Error Loading Campaigns</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={loadCampaigns}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Active Campaigns
            </h1>
            <p className="text-gray-400 mt-2">
              Support the next generation of Web3 projects
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={loadCampaigns}
              className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <Link 
              to="/my-campaigns" 
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Campaign
            </Link>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Active Campaigns</h3>
              <p className="text-gray-500 mb-6">Be the first to create a campaign and start raising funds!</p>
              <Link 
                to="/my-campaigns"  
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Launch Your Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <div 
                key={campaign.id} 
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                {campaign.imageHash ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={`https://ipfs.io/ipfs/${campaign.imageHash}`} 
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'placeholder-image.jpg';
                        e.target.className = 'w-full h-48 bg-gray-700 object-contain p-4';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-1">{campaign.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{campaign.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Raised</span>
                      <span className="font-medium">
                        {campaign.raised} ETH <span className="text-gray-400">of {campaign.goal} ETH</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, 
                            (parseFloat(campaign.raised)/parseFloat(campaign.goal)*100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                    <span>By: {`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(38)}`}</span>
                    <span>
                      {Math.round((parseFloat(campaign.raised)/parseFloat(campaign.goal))*100)}% funded
                    </span>
                  </div>
                  
                  <Link 
                    to={`/campaign/${campaign.id}`}
                    className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}