import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Blockchain Architect",
      bio: "Ethereum expert with deep knowledge of smart contracts and decentralized systems.",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Security Lead",
      bio: "Specializes in smart contract auditing and privacy-preserving technologies.",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Marcus Lee",
      role: "UX Engineer",
      bio: "Focuses on making Web3 accessible through intuitive interfaces.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Decentralized Funding Platform
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Empowering creators and supporters through blockchain technology.
            Launch transparent campaigns with smart contract-powered funding and
            customizable privacy settings.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white">
              Our Web3 Principles
            </h3>
            <p className="text-gray-300">
              We're building a platform that puts power back in users' hands with
              decentralized technology and transparent operations.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">
                  Non-custodial funds management
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">
                  Smart contract escrow for secure funding
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">
                  Privacy controls with zero-knowledge proofs
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">
                  Fully audited and open-source smart contracts
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4">
              <div
                className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter"
                style={{
                  background:
                    "linear-gradient(90deg, #8B5CF6 0%, #06B6D4 100%)",
                }}
              ></div>
            </div>
            <div className="relative bg-gray-800 rounded-xl shadow-xl overflow-hidden h-full border border-gray-700">
              <img
                src="https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80"
                alt="Blockchain technology"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-block p-4 rounded-full bg-gray-900 bg-opacity-70 mb-4">
                    <svg
                      className="w-12 h-12 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Powered by Blockchain
                  </h3>
                  <p className="text-gray-300">
                    Transparent, secure, and decentralized funding platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-6">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-700"
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Trustless Funding
                </h4>
                <p className="text-gray-300">
                  Campaign funds held in smart contract escrow until conditions
                  are met.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-700"
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-cyan-900 bg-opacity-50 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Privacy Controls
                </h4>
                <p className="text-gray-300">
                  Choose what campaign data is public, private, or visible only
                  to supporters.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-700"
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-purple-900 bg-opacity-50 flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Secure & Audited
                </h4>
                <p className="text-gray-300">
                  Regular smart contract audits and bug bounty programs to ensure
                  platform security.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

       

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
        >
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to launch your campaign?
              </h2>
              <p className="mt-3 max-w-3xl text-lg leading-6 text-purple-100">
                Join our decentralized funding platform today.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:ml-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 transition-all duration-300 shadow-lg"
              >
                Connect Wallet
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;