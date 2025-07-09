import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { contractABI, contractAddress } from '../web3/config';

const AdminPanel = ({ contract }) => {
  const { account, isActive } = useWeb3React();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const safeFormatEther = (value) => {
    try {
      if (!value || value.toString() === '0') return '0';
      return ethers.formatEther(value.toString());
    } catch (err) {
      console.error('Error formatting value:', value, err);
      return '0';
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!contract || !account) return;

        const adminAddress = await contract.admin();
        const adminStatus = adminAddress.toLowerCase() === account.toLowerCase();
        setIsAdmin(adminStatus);

        if (adminStatus) {
          await loadCampaigns();
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [contract, account]);

  const loadCampaigns = async () => {
    if (!isActive) {
      setError('Wallet not connected');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
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
                  owner: data[0] || '',
                  title: data[1] || '',
                  description: data[2] || '',
                  imageHash: data[3] || '',
                  goalAmount: data[4] || '0',
                  totalRaised: data[5] || '0',
                  isActive: data[6] || false,
                  milestones: (data[7] || []).map(m => m || '0'),
                  currentMilestone: data[8] || 0,
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
            goal: safeFormatEther(data.goalAmount),
            raised: safeFormatEther(data.totalRaised),
            owner: data.owner,
            imageHash: data.imageHash,
            milestones: data.milestones.map(m => safeFormatEther(m)),
            currentMilestone: Number(data.currentMilestone) || 0,
            isActive: data.isActive
          });
        }
      }
  
      setCampaigns(loadedCampaigns);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (campaignId) => {
    setCampaignToDelete(campaignId);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    setShowConfirmModal(false);
    try {
      const tx = await contract.adminDeleteCampaign(campaignToDelete);
      await tx.wait();
      await loadCampaigns();
      setError('Campaign deleted successfully');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign: ' + (err.reason || err.message));
    }
  };
 
  const handleChangeAdmin = async () => {
    try {
      if (!newAdmin || !ethers.isAddress(newAdmin)) {
        throw new Error("Please enter a valid Ethereum address");
      }
      
      const tx = await contract.changeAdmin(newAdmin);
      await tx.wait();
      setError('Admin changed successfully');
      setNewAdmin('');
    } catch (err) {
      console.error('Error changing admin:', err);
      setError('Failed to change admin: ' + (err.reason || err.message));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 w-16 bg-indigo-500 rounded-full mb-4"></div>
        <p className="text-indigo-300 text-lg">Checking admin status...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md text-center">
        <div className="text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Access Denied</h3>
        <p className="text-gray-400 mb-4">You are not authorized to access this panel</p>
        <p className="text-gray-500 text-sm">
          Connected account: {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not connected'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage platform settings and campaigns
            </p>
          </div>
          
          <button
            onClick={loadCampaigns}
            className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${error.includes('success') ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={error.includes('success') ? "M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} 
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Admin Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Admin</label>
              <div className="bg-gray-700 p-3 rounded-lg text-indigo-400 font-mono">
                {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not connected'}
              </div>
            </div>
            
            <div>
              <label htmlFor="newAdmin" className="block text-sm font-medium text-gray-300 mb-2">Transfer Admin Role</label>
              <div className="flex space-x-2">
                <input
                  id="newAdmin"
                  type="text"
                  value={newAdmin}
                  onChange={(e) => setNewAdmin(e.target.value)}
                  placeholder="0x123..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button 
                  onClick={handleChangeAdmin}
                  disabled={!newAdmin || !ethers.isAddress(newAdmin)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold">All Campaigns ({campaigns.length})</h3>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Campaigns Found</h3>
              <p className="text-gray-500">There are no active campaigns to display</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Raised</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {campaigns.map(campaign => (
                    <tr key={campaign.id} className={`hover:bg-gray-700/50 transition-colors ${!campaign.isActive ? 'opacity-70' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{campaign.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{campaign.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(38)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{campaign.raised} ETH</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${campaign.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteClick(campaign.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl transform transition-all">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;