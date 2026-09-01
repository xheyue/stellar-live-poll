# 🗳️ Stellar Live Poll

Stellar Live Poll is a decentralized voting application built on the Stellar Testnet.

Users can connect a Stellar wallet, view their XLM balance, see live poll results, and submit a vote directly to a Soroban smart contract.

## ✨ Features

- Multi-wallet connection using Stellar Wallets Kit
- Stellar Testnet support
- Display connected wallet address
- Display XLM balance
- Read live voting results from a Soroban smart contract
- Vote directly on-chain
- One vote per wallet
- Transaction status feedback
- Transaction hash display
- Stellar Explorer transaction link
- Duplicate-vote error handling
- Wallet rejection/error handling

## 🗳️ Poll Options

The current poll contains three options:

- 🤖 AI
- ⛓️ Blockchain
- 🎮 Game Development

## 🛠️ Technologies

- React
- Vite
- JavaScript
- Rust
- Soroban
- Stellar SDK
- Stellar Wallets Kit
- Stellar Horizon
- Stellar RPC

## 🌐 Network

This project runs on **Stellar Testnet**.

No real XLM is used.

## 📜 Smart Contract

Deployed Testnet Contract ID:

    CAKRUL2B26CLC3G2PGU6BQBCSUSDMXKWKCWAZUOGXEJPOZUQHQWRE25Z

The smart contract provides the following functions:

- `vote`
- `get_votes`
- `has_voted`

The contract prevents the same wallet from voting more than once.

## 🔗 Example Successful Transaction

A successful Testnet vote transaction:

    d8f08f35dc00b3e989c5bf7fdabc5b6c3000800a9e9e379516e0ce04dfb700f2

The application also provides a direct Stellar Explorer link after a successful vote.

## 📁 Project Structure

    stellar-live-poll/
    ├── contracts/
    │   └── hello-world/
    │       ├── src/
    │       │   ├── lib.rs
    │       │   └── test.rs
    │       └── Cargo.toml
    ├── frontend/
    │   ├── src/
    │   │   ├── services/
    │   │   │   └── contract.js
    │   │   ├── App.jsx
    │   │   └── App.css
    │   └── package.json
    ├── Cargo.toml
    └── README.md

## 🚀 Installation

Clone the repository:

    git clone https://github.com/xheyue/stellar-live-poll.git

Open the project:

    cd stellar-live-poll

Install frontend dependencies:

    cd frontend
    npm install

Start the development server:

    npm run dev

Open the local URL displayed by Vite in your browser.

## 💼 How to Use

1. Open Stellar Live Poll.
2. Click **Connect Wallet**.
3. Select a supported Stellar wallet.
4. Connect a Stellar Testnet account.
5. The application displays the wallet address and XLM balance.
6. Select AI, Blockchain, or Game Development.
7. Click **Vote**.
8. Approve the transaction in your wallet.
9. Wait for the transaction to be confirmed.
10. The poll results automatically update.
11. The successful transaction hash is displayed with a Stellar Explorer link.

## 🛡️ Error Handling

The application handles common errors including:

- Wallet connection failure
- Balance loading failure
- Smart contract simulation failure
- Transaction signing failure
- Wallet transaction rejection
- Transaction submission failure
- Duplicate voting

When a wallet attempts to vote more than once, the interface displays:

    Failed: You have already voted in this poll.

## 📸 Screenshots

### Wallet Connected and Live Poll

Add screenshot here.

### Successful On-Chain Vote

Add screenshot here.

### Duplicate Vote Protection

Add screenshot here.

## 🔐 Security

The application never asks users to enter their secret key or recovery phrase.

Transactions are signed through the user's connected Stellar wallet.

## 🧪 Development

The project was developed incrementally using Git with meaningful commits for smart contract development, wallet integration, balance display, contract reads, on-chain voting, transaction handling, and error handling.

## 📄 License

This project was created for educational purposes.