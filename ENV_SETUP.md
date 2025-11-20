# Shadow Cipher Clash - Environment Setup Guide

## Frontend Environment Variables

Create a `.env.local` file in the `ui/packages/nextjs` directory with the following variables:

```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0xYourSepoliaContractAddress
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0xYourLocalContractAddress

# Wallet Connect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# FHEVM Configuration
NEXT_PUBLIC_FHEVM_RELAY_URL=https://relayer.fhevm.network
NEXT_PUBLIC_FHEVM_GATEWAY_URL=https://gateway.fhevm.network

# Application Settings
NEXT_PUBLIC_APP_NAME="Shadow Cipher Clash"
NEXT_PUBLIC_APP_DESCRIPTION="Encrypted betting platform with FHE technology"
```

## Backend Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Network Configuration
INFURA_API_KEY=your_infura_api_key
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Deployment
DEPLOY_NETWORK=sepolia
GAS_PRICE=8000000000
```

## Development Setup

### Prerequisites
- Node.js 20+
- npm or yarn or pnpm
- MetaMask or compatible Web3 wallet

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd ui && npm install
   ```

2. **Start local blockchain:**
   ```bash
   npm run chain
   ```

3. **Deploy contracts:**
   ```bash
   npm run deploy:local
   ```

4. **Start frontend:**
   ```bash
   cd ui/packages/nextjs
   npm run dev
   ```

### Production Deployment

1. **Build contracts:**
   ```bash
   npm run compile
   ```

2. **Deploy to Sepolia:**
   ```bash
   npm run deploy:sepolia
   ```

3. **Build frontend:**
   ```bash
   cd ui/packages/nextjs
   npm run build
   ```

4. **Deploy to Vercel:**
   ```bash
   npm run vercel
   ```

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific contract addresses
- Keep private keys secure and never expose them
- Use hardware wallets for production deployments

## Troubleshooting

### Common Issues

1. **FHEVM Connection Failed**
   - Check MetaMask network configuration
   - Verify contract addresses in environment variables
   - Ensure relayer service is accessible

2. **Transaction Reverted**
   - Check wallet balance for gas fees
   - Verify contract deployment on target network
   - Review transaction logs for error details

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors
   - Verify all environment variables are set
