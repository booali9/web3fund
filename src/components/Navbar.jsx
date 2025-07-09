import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ contract }) => {
  const { isActive: isConnected, account, chainId, connector } = useWeb3React();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [isHoveringConnect, setIsHoveringConnect] = useState(false);

  // Check if connected wallet is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (contract && account) {
        try {
          setAdminCheckLoading(true);
          const adminAddress = await contract.admin();
          setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setAdminCheckLoading(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [contract, account]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      await connector.activate();
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (connector?.deactivate) {
        await connector.deactivate();
      } else {
        await connector.resetState();
      }
      setShowNetworkInfo(false);
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const generateAvatarFromAddress = (address) => {
    if (!address) return 'from-gray-400 to-gray-500';
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-teal-400',
      'from-green-400 to-cyan-400',
      'from-yellow-400 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-600'
    ];
    const colorIndex = parseInt(address.slice(2, 4), 16) % gradients.length;
    return gradients[colorIndex];
  };

  const getNetworkName = () => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Mumbai Testnet';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const navItems = [
    { path: "/", name: "Home" },
    { path: "/my-campaigns", name: "My Campaigns" },
    ...(isAdmin && !adminCheckLoading ? [{ path: "/admin", name: "Admin" }] : []),
    { path: "/about", name: "About" }
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1 }}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg mr-3 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <span className="text-white text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-500">
                Web3Fund
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium relative group transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.span
                          layoutId="navActiveBg"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                          transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                      {!isActive && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Search and Wallet - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.form 
              onSubmit={handleSearch}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search campaigns..."
                className="px-4 py-2 rounded-full bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 border border-gray-600 transition-all duration-300 w-64 pl-10 pr-4 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.form>

            {isConnected ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative"
              >
                <button
                  onClick={() => setShowNetworkInfo(!showNetworkInfo)}
                  className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-600 transition-all duration-300 group"
                >
                  <div className={`bg-gradient-to-r ${generateAvatarFromAddress(account)} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                    {account ? account.charAt(account.length - 4).toUpperCase() : ''}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {formatAddress(account)}
                  </span>
                  {isAdmin && (
                    <span className="text-yellow-300" title="Admin">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.672.49-1.818-.197-1.118-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNetworkInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
                      className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-lg"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-300">Connected Wallet</p>
                        <p className="text-xs text-gray-400 truncate mt-1" title={account}>{account}</p>
                      </div>
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-sm font-medium text-gray-300">Network</p>
                        <p className="text-xs text-cyan-400 mt-1">{getNetworkName()}</p>
                      </div>
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-700/50 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Disconnect Wallet
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                onClick={connectWallet}
                disabled={isConnecting}
                onMouseEnter={() => setIsHoveringConnect(true)}
                onMouseLeave={() => setIsHoveringConnect(false)}
                className={`relative overflow-hidden px-6 py-2.5 rounded-full text-white font-medium shadow-lg transition-all duration-500 ${
                  isConnecting 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-pink-500 hover:to-purple-600'
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Connect Wallet
                    </>
                  )}
                </span>
                {isHoveringConnect && !isConnecting && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ duration: 0.6 }}
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {!isConnecting && (
                    <>
                      <span className="absolute -inset-10 bg-gradient-to-r from-white/30 to-transparent [transform:rotate(30deg)] group-hover:animate-shine" />
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-800/95 backdrop-blur-lg overflow-hidden border-t border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-lg text-base font-medium relative group transition-colors ${
                      isActive ? 'text-white bg-gray-700/50' : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Search - Mobile */}
            <div className="px-2 pt-2 pb-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full px-4 py-2 pl-10 rounded-full bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 border border-gray-600 transition-all duration-300 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>

            {/* Wallet - Mobile */}
            <div className="px-2 pt-2 pb-4">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-r ${generateAvatarFromAddress(account)} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                        {account ? account.charAt(account.length - 4).toUpperCase() : ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{formatAddress(account)}</p>
                        <p className="text-xs text-cyan-400">{getNetworkName()}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="text-yellow-300" title="Admin">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.672.49-1.818-.197-1.118-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-700/50 border border-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium shadow-lg transition-all duration-500 ${
                    isConnecting 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-pink-500 hover:to-purple-600'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Connect Wallet
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection error notification */}
      <AnimatePresence>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between max-w-md z-50 backdrop-blur-sm border border-red-400/30"
          >
            <span className="text-sm">{connectionError}</span>
            <button 
              onClick={() => setConnectionError(null)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;