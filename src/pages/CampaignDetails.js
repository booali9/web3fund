import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { contractABI, contractAddress } from '../web3/config';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

export default function CampaignDetail() {
  const { id } = useParams();
  const { isActive, account } = useWeb3React();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const getEthersProvider = () => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error('No Ethereum provider found');
  };

  const loadCampaign = async () => {
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

      const data = await contract.getCampaign(id);
      
      const campaignData = {
        owner: data[0],
        title: data[1],
        description: data[2],
        imageHash: data[3],
        goalAmount: data[4],
        totalRaised: data[5],
        isActive: data[6],
        milestones: data[7],
        currentMilestone: data[8]
      };

      if (!campaignData.title) {
        throw new Error('Campaign does not exist');
      }

      setCampaign({
        id: id.toString(),
        title: campaignData.title,
        description: campaignData.description,
        goal: ethers.formatEther(campaignData.goalAmount),
        raised: ethers.formatEther(campaignData.totalRaised),
        owner: campaignData.owner,
        imageHash: campaignData.imageHash,
        milestones: campaignData.milestones.map(m => ethers.formatEther(m)),
        currentMilestone: Number(campaignData.currentMilestone),
        isActive: campaignData.isActive
      });

    } catch (err) {
      console.error('Error loading campaign:', err);
      setError('Failed to load campaign: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || isNaN(donationAmount) || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    setIsDonating(true);
    setError('');
    setDonationSuccess(false);

    try {
      const ethersProvider = getEthersProvider();
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();
      
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const amountInWei = ethers.parseEther(donationAmount);
      const tx = await contract.donate(id, { value: amountInWei });

      setTxHash(tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setDonationSuccess(true);
        contract.once("DonationMade", (campaignId, donor, amount) => {
          if (campaignId.toString() === id && donor === userAddress) {
            console.log(`Donation confirmed: ${ethers.formatEther(amount)} ETH`);
          }
        });
        
        await loadCampaign();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Donation failed:', err);
      if (err.message.includes("Invalid campaign ID")) {
        setError('Invalid campaign ID');
      } else if (err.message.includes("Campaign does not exist")) {
        setError('Campaign does not exist');
      } else if (err.message.includes("Campaign is not active")) {
        setError('This campaign is no longer active');
      } else if (err.message.includes("Donation amount must be positive")) {
        setError('Donation amount must be greater than 0');
      } else {
        setError('Donation failed: ' + (err.reason || err.message));
      }
    } finally {
      setIsDonating(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 w-16 bg-indigo-500 rounded-full mb-4"></div>
        <p className="text-indigo-300 text-lg">Loading campaign details...</p>
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
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Error Loading Campaign</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Link 
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Campaigns
        </Link>
      </div>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md text-center">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Campaign Not Found</h3>
        <p className="text-gray-400 mb-4">The requested campaign does not exist</p>
        <Link 
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Campaigns
        </Link>
      </div>
    </div>
  );

  const progressPercentage = Math.min(100, (parseFloat(campaign.raised)/parseFloat(campaign.goal)*100));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Campaigns
        </Link>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="md:flex">
            <div className="md:w-1/2">
              {campaign.imageHash ? (
                <div className="h-64 md:h-full overflow-hidden">
                  <img 
                    src={`https://ipfs.io/ipfs/${campaign.imageHash}`} 
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'placeholder-image.jpg';
                      e.target.className = 'w-full h-full bg-gray-700 object-contain p-4';
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 md:h-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-6 md:w-1/2">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h1>
              <p className="text-gray-400 mb-4">
                Created by: <span className="text-indigo-400">{`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(38)}`}</span>
              </p>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Raised</span>
                  <span className="font-medium">
                    {campaign.raised} ETH <span className="text-gray-400">of {campaign.goal} ETH</span>
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1 text-sm text-indigo-400">
                  {progressPercentage.toFixed(2)}% funded
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">About this campaign</h3>
                <p className="text-gray-300">{campaign.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Milestones</h3>
                <div className="space-y-2">
                  {campaign.milestones.map((amount, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${index < campaign.currentMilestone ? 'border-green-500 bg-green-500/10' : 'border-gray-700'} transition-all duration-300`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {index < campaign.currentMilestone ? (
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-700 text-gray-400 mr-3">
                              {index + 1}
                            </span>
                          )}
                          <span>Milestone {index + 1}</span>
                        </div>
                        <span className="font-medium">{amount} ETH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Support this campaign</h3>
          
          {donationSuccess ? (
            <div className="text-center p-6 bg-gray-700/50 rounded-lg">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-green-400 mb-2">Thank you for your donation!</h4>
              <p className="text-gray-300 mb-4">Your support helps bring this project to life.</p>
              {txHash && (
                <a 
                  href={`https://etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-400 hover:text-indigo-300 mb-4"
                >
                  View transaction on Etherscan
                </a>
              )}
              <button 
                onClick={() => {
                  setDonationSuccess(false);
                  setDonationAmount('');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Make Another Donation
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.0001"
                  step="0.0001"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                />
                <span className="absolute right-4 top-3 text-gray-400">ETH</span>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleDonate}
                disabled={isDonating || !isActive}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-300 ${isActive ? 
                  'bg-indigo-600 hover:bg-indigo-700 text-white' : 
                  'bg-gray-700 text-gray-400 cursor-not-allowed'} ${isDonating ? 'opacity-75' : ''}`}
              >
                {isDonating ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : isActive ? (
                  'Donate Now'
                ) : (
                  'Connect Wallet to Donate'
                )}
              </button>
              
              {!isActive && (
                <p className="mt-3 text-center text-gray-400">
                  You need to connect your wallet to make a donation
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}