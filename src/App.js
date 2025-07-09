import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import AdminPanel from './pages/AdminPanel';
import { contractABI, contractAddress } from './web3/config';
import './tailwind.css';
import AboutUs from './pages/AboutUs';

function App() {
  const [contract, setContract] = useState(null);
  const { account } = useWeb3React();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const crowdfundingContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(crowdfundingContract);
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      }
    };

    initializeContract();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
         <Navbar 
          contract={contract} 
          searchQuery={searchQuery} 
          onSearch={handleSearch} 
        />
        
        <main className="flex-grow">
          <Routes>
             <Route path="/" element={<Home contract={contract} searchQuery={searchQuery} />} />
            <Route path="/my-campaigns" element={<CreateCampaign contract={contract} />} />
            <Route path="/campaign/:id" element={<CampaignDetails contract={contract} />} />
            <Route path="/about" element={<AboutUs/>} />
            <Route 
              path="/admin" 
              element={<AdminPanel contract={contract} account={account} />} 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;