require("@nomicfoundation/hardhat-toolbox");

// .env.local dosyasını manuel olarak yükle
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Oasis Sapphire Testnet
    sapphire_testnet: {
      url: "https://testnet.sapphire.oasis.io",
      accounts: ["0xb5c6c30698772875868c094e695f1e9b2bbdfa845f8061740e69374ad03e33a8"],
      chainId: 0x5aff,
    },
    // Oasis Sapphire Mainnet
    sapphire_mainnet: {
      url: "https://sapphire.oasis.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 0x5afe,
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      // Oasis explorer API keys (opsiyonel)
      sapphire_testnet: process.env.OASIS_EXPLORER_API_KEY || "",
      sapphire_mainnet: process.env.OASIS_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "sapphire_testnet",
        chainId: 0x5aff,
        urls: {
          apiURL: "https://testnet.explorer.sapphire.oasis.io/api",
          browserURL: "https://testnet.explorer.sapphire.oasis.io"
        }
      },
      {
        network: "sapphire_mainnet", 
        chainId: 0x5afe,
        urls: {
          apiURL: "https://explorer.sapphire.oasis.io/api",
          browserURL: "https://explorer.sapphire.oasis.io"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}; 