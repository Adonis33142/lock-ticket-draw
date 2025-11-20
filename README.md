# 🎭 Shadow Cipher Clash - Encrypted Gaming Platform

A privacy-preserving gaming platform built with [Zama's FHEVM](https://docs.zama.ai/fhevm) (Fully Homomorphic Encryption Virtual Machine), featuring encrypted raffle system and private betting with provably fair outcomes.

## 🎬 Live Demo

🚀 **Try it now**: [https://shadow-cipher-clash.vercel.app/](https://shadow-cipher-clash.vercel.app/)

📹 **Demo Video**: [Watch the demo](./shadow.mp4)

## 🌟 Features

- 🎟️ **Encrypted Raffle System**: Purchase raffle tickets with fully encrypted values
- 🎲 **Private Betting**: Place bets with encrypted wagers and guesses
- 🔒 **Full Privacy**: All sensitive data remains encrypted on-chain
- 🎯 **Provably Fair**: Verifiable fairness without revealing individual entries
- 🌐 **Multi-Network Support**: Works on both Hardhat local network and Sepolia testnet
- ⚡ **Modern UI**: Beautiful React/Vite frontend with modern gaming UI

## 🎮 How It Works

### Encrypted Raffle
1. **Purchase Tickets**: Buy raffle entries with encrypted values
2. **Hidden Until Draw**: All entries remain encrypted until the draw concludes
3. **Fair Drawing**: Results are determined without revealing individual entries
4. **Provably Fair**: Front-running prevention through encryption

### Private Betting
1. **Place Bets**: Submit encrypted wagers and guesses
2. **Instant Settlement**: Outcomes calculated on encrypted data
3. **Private Results**: Only authorized addresses can decrypt outcomes
4. **House Audit**: Designated house address has audit rights

## 🔐 Core Smart Contracts

### PrivateBet.sol

The main betting contract that handles fully encrypted wagering:

```solidity
contract PrivateBet is SepoliaConfig {
    struct Bet {
        address player;
        euint64 wager;       // Encrypted wager amount
        euint8 guess;        // Encrypted guess
        euint8 outcome;      // Encrypted outcome
        euint64 payout;      // Encrypted payout
        uint64 createdAt;
        BetState state;
    }
    
    // All operations on encrypted data
    function placeBet(
        externalEuint64 wagerHandle,
        bytes calldata wagerProof,
        externalEuint8 guessHandle,
        bytes calldata guessProof
    ) external returns (uint256 betId);
}
```

**Key Privacy Features:**
- ✅ Encrypted wagers
- ✅ Encrypted guesses
- ✅ Encrypted outcomes
- ✅ Encrypted payouts
- ✅ Selective decryption with access control

## 🔐 Core Encryption Logic

### Client-Side Encryption

The encryption process happens entirely in the user's browser before data reaches the blockchain:

```typescript
// 1. Generate encryption instance
const instance = await createInstance({
  chainId: await provider.getNetwork().then(n => n.chainId),
  publicKey: await contract.getPublicKey()
});

// 2. Encrypt sensitive data
const encryptedWager = instance.encrypt64(wagerAmount);
const encryptedGuess = instance.encrypt8(guessValue);

// 3. Create input proofs
const wagerInput = await instance.createEncryptedInput(
  contractAddress,
  userAddress
);
wagerInput.add64(wagerAmount);
const wagerProof = wagerInput.encrypt();

// 4. Submit encrypted data to contract
await contract.placeBet(
  wagerProof.handles[0],  // Encrypted wager handle
  wagerProof.inputProof,  // Zero-knowledge proof
  guessProof.handles[0],  // Encrypted guess handle  
  guessProof.inputProof   // Zero-knowledge proof
);
```

### On-Chain Homomorphic Operations

The smart contract performs computations **without decrypting** the data:

```solidity
// Contract operations on encrypted data
function placeBet(
    bytes32 wagerHandle,
    bytes calldata wagerProof,
    bytes32 guessHandle,
    bytes calldata guessProof
) external returns (uint256 betId) {
    // 1. Import encrypted inputs
    euint64 wager = FHE.asEuint64(wagerHandle, wagerProof);
    euint8 guess = FHE.asEuint8(guessHandle, guessProof);
    
    // 2. Generate encrypted random outcome
    euint8 outcome = FHE.randEuint8();
    
    // 3. Homomorphic comparison (without decryption!)
    ebool isWinner = FHE.eq(guess, FHE.rem(outcome, 2));
    
    // 4. Calculate encrypted payout (2x wager if winner)
    euint64 winAmount = FHE.mul(wager, 2);
    euint64 payout = FHE.select(isWinner, winAmount, FHE.asEuint64(0));
    
    // 5. Store encrypted results
    bets[betId] = Bet({
        player: msg.sender,
        wager: wager,
        guess: guess,
        outcome: outcome,
        payout: payout,
        state: BetState.Settled
    });
    
    // 6. Grant decryption access to player
    FHE.allowTransient(wager, msg.sender);
    FHE.allowTransient(outcome, msg.sender);
    FHE.allowTransient(payout, msg.sender);
    
    return betId;
}
```

### Selective Decryption

Only authorized addresses can decrypt results:

```typescript
// 1. Request decryption permission (generates signature)
const { publicKey, privateKey } = instance.generateKeypair();
const eip712 = instance.createEIP712(contractAddress, publicKey);
const signature = await signer.signTypedData(
  eip712.domain,
  { Reencrypt: eip712.types.Reencrypt },
  eip712.message
);

// 2. Get encrypted handle from contract
const { handles, inputProof } = await contract.getEncryptedBetDetails(betId);

// 3. Decrypt with user's private key
const decryptedWager = instance.decrypt(contractAddress, handles[0]);
const decryptedOutcome = instance.decrypt(contractAddress, handles[2]);
const decryptedPayout = instance.decrypt(contractAddress, handles[3]);
```

### Privacy Guarantees

| Operation | Visibility | Security |
|-----------|-----------|----------|
| **Client Encryption** | Only user sees plaintext | Browser-local, never transmitted |
| **On-Chain Storage** | All encrypted (`euint*`) | Homomorphic encryption (FHE) |
| **Computation** | Results stay encrypted | FHE operations: add, mul, eq, select |
| **Decryption** | Requires signature + ACL | EIP-712 signature + on-chain permission |
| **Audit Trail** | House can audit | Granular access control per bet |

### Homomorphic Operation Examples

```solidity
// Example: Adding two encrypted numbers
euint8 a = FHE.asEuint8(5);  // Encrypted 5
euint8 b = FHE.asEuint8(3);  // Encrypted 3
euint8 c = FHE.add(a, b);    // Encrypted 8 (computed without decryption!)

// Example: Comparing encrypted values
ebool isGreater = FHE.ge(c, FHE.asEuint8(7));  // Encrypted "true"

// Example: Conditional selection
euint8 result = FHE.select(isGreater, a, b);   // Returns 'a' if true, 'b' if false

// Example: Random number generation (encrypted)
euint8 randomValue = FHE.randEuint8();  // Encrypted random [0, 255]
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm, npm, or yarn
- MetaMask or compatible wallet
- (Optional) Sepolia ETH for testnet deployment

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Adonis33142/lock-ticket-draw.git
cd lock-ticket-draw
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Or if using pnpm
pnpm install
```

3. **Start local network**
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost
```

4. **Start frontend**
```bash
# Terminal 3: Start Vite dev server
npm run dev

# Or with pnpm
pnpm dev
```

5. **Configure MetaMask**
- Network: Hardhat Local
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency: ETH

6. **Import test account**
- Copy any account (address + private key) displayed in the Hardhat node console when it starts

7. **Open the app**
```
http://localhost:5173
```

## 📁 Project Structure

```
shadow-cipher-clash/
├── contracts/          # Solidity contracts
│   ├── PrivateBet.sol # Private betting contract
│   └── FHECounter.sol # Example FHE contract
├── src/               # React/Vite frontend
│   ├── components/    # React components
│   │   ├── TicketCard.tsx
│   │   ├── DrawCountdown.tsx
│   │   └── ui/       # shadcn/ui components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities
├── deploy/           # Hardhat deployment scripts
├── test/            # Contract tests
├── tasks/           # Hardhat tasks
└── public/          # Static assets
```

## 🔧 Available Scripts

### Backend (Hardhat)

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Run Hardhat node
npx hardhat node

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Frontend (Vite)

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Networks

### Hardhat Local (Development)

- **Chain ID**: 31337
- **RPC**: http://localhost:8545
- **FHEVM**: Mock mode (instant, no external dependencies)
- **Best for**: Development and testing

### Sepolia Testnet (Public Testing)

- **Chain ID**: 11155111
- **FHEVM**: Zama RelayerSDK (requires internet connection)
- **Faucet**: https://sepoliafaucet.com/
- **Best for**: Public demos and collaborative testing

## 🎯 Key Technologies

### Smart Contracts
- Solidity + FHEVM
- Homomorphic encryption operations
- Access control and privacy management

### Frontend
- React 18 with TypeScript
- Vite for fast development
- shadcn/ui component library
- Tailwind CSS for styling
- Lucide React for icons

### Development Tools
- Hardhat for smart contract development
- TypeChain for type-safe contract interactions
- ESLint + Prettier for code quality

## 🔒 Privacy Guarantees

### What's Encrypted?

| Data Type | Encryption Status | Who Can Decrypt |
|-----------|------------------|-----------------|
| Wager Amount | ✅ Encrypted (`euint64`) | Player + House |
| Guess Value | ✅ Encrypted (`euint8`) | Player + House |
| Outcome | ✅ Encrypted (`euint8`) | Player + House |
| Payout | ✅ Encrypted (`euint64`) | Player + House |
| Raffle Entries | ✅ Encrypted | Authorized viewers |

### What's Public?

- ⚠️ Player addresses
- ⚠️ Transaction timestamps
- ⚠️ Bet counts
- ⚠️ General game state

## 🧪 Testing

### Run All Tests

```bash
npx hardhat test
```

### Test on Sepolia

```bash
npx hardhat test --network sepolia
```

### Test Coverage

The project includes comprehensive tests for:
- Contract deployment and initialization
- Encrypted bet placement and settlement
- Access control and permissions
- Decryption functionality
- Privacy guarantees

## 🎨 UI Features

- **Modern Gaming Interface**: Sleek, responsive design
- **Ticket Purchase System**: Interactive raffle ticket cards
- **Countdown Timer**: Real-time draw countdown
- **Wallet Integration**: Seamless wallet connection
- **Responsive Design**: Works on desktop and mobile

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for development environment
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vite](https://vitejs.dev/) for blazing fast development
- Original template from [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)

## 📞 Support

- **GitHub**: https://github.com/Adonis33142/lock-ticket-draw
- **Live Demo**: https://shadow-cipher-clash.vercel.app/
- **Zama Docs**: https://docs.zama.ai/fhevm
- **Zama Discord**: https://discord.com/invite/fhe-org

## 🔒 Security Features

### Fully Homomorphic Encryption (FHE)
- **Zero-Knowledge Betting**: Wagers and predictions remain encrypted throughout the betting process
- **Privacy-Preserving Results**: Only winners can decrypt their payout amounts
- **Cryptographic Fairness**: Provably fair outcomes using FHE-verified randomness

### Smart Contract Security
- **Input Validation**: Comprehensive validation of all user inputs and FHE proofs
- **Access Control**: Granular permissions for viewing and decrypting bet data
- **Rate Limiting**: Prevents spam betting and potential DoS attacks
- **Reentrancy Protection**: Guards against reentrancy attacks on counter operations

### Frontend Security
- **Proof Validation**: Client-side validation of FHE proof data integrity
- **Wallet Integration**: Secure connection to Web3 wallets with proper error handling
- **Input Sanitization**: All user inputs are validated and sanitized

## 🎭 Try It Now!

Clone the repository and start building privacy-preserving gaming applications with FHEVM!

---

**Built with ❤️ and 🔐 using Zama FHEVM**
