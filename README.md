# ShadowAuth 🛡️

A privacy-focused authentication platform built on the Oasis ecosystem (Sapphire ParaTime and ROFL) that enables completely anonymous and secure user authentication using World ID, ZK-Proofs, and session key management.

![ShadowAuth](public/shield.svg)

## Features 🌟

- **Complete Privacy**: User wallet addresses are never exposed to dApps
- **Zero-Knowledge Proofs**: Secure identity verification without revealing personal data
- **Off-chain Verification**: All verifications happen on ROFL network, leaving no on-chain traces
- **Session Key Management**: Temporary, anonymous session keys for secure dApp access
- **Developer-Friendly**: Simple SDK that abstracts complex ZK and blockchain operations

## Tech Stack 💻

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Oasis Sapphire ParaTime, ROFL Network
- **Authentication**: World ID Integration
- **Privacy**: Zero-Knowledge Proofs
- **Security**: Off-chain Session Key Generation

## How It Works 🔄

1. **ZK-Proof Generation**
   - User verifies their identity with World ID
   - A zero-knowledge proof is generated
   - No wallet address is ever revealed

2. **ROFL Verification**
   - ZK-Proof is verified off-chain on the Oasis ROFL network
   - Verification process leaves no trace on the blockchain

3. **Session Key Generation**
   - Upon successful verification, a temporary session key is generated
   - This anonymous key enables secure dApp access

## Getting Started 🚀

### Prerequisites

```bash
Node.js 18+
npm or yarn
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SweetieBirdX/shadowauth.git
cd shadowauth
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Smart Contracts 📝

The project includes a `SessionKeyManager.sol` contract deployed on Oasis Sapphire ParaTime that handles:

- Secure session key management
- World ID nullifier verification
- App-specific session validation
- Confidential data storage

### Contract Deployment

```bash
npx hardhat run scripts/deploy.js --network sapphire
```

## API Routes 🛣️

- `/api/v1/login`: Handles World ID verification and session creation
- `/api/v1/session/verify`: Validates session keys

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Security 🔒

- All session keys are temporary and automatically expire
- Zero-knowledge proofs ensure complete privacy
- Off-chain verification prevents blockchain tracking
- Sapphire ParaTime provides confidential contract execution

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

For support, please join our [Discord community](https://discord.gg/shadowauth) or open an issue on GitHub.
