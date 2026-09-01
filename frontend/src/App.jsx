import { useState } from "react";
import { Networks } from "@stellar/stellar-sdk";

import {
  getVotes,
  prepareVoteTransaction,
  submitVoteTransaction,
} from "./services/contract";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

import "./App.css";

StellarWalletsKit.init({
  modules: defaultModules(),
});

StellarWalletsKit.setNetwork(Networks.TESTNET);

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);

  const [votes, setVotes] = useState({
    ai: 0,
    blockchain: 0,
    gameDev: 0,
  });

  const [selectedOption, setSelectedOption] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const fetchBalance = async (address) => {
    try {
      setIsLoadingBalance(true);

      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${address}`
      );

      if (!response.ok) {
        throw new Error("Could not fetch wallet balance.");
      }

      const account = await response.json();

      const xlmBalance = account.balances.find(
        (item) => item.asset_type === "native"
      );

      setBalance(
        xlmBalance ? xlmBalance.balance : "0"
      );
    } catch (error) {
      console.error("Balance error:", error);
      setBalance(null);

      setStatus(
        error?.message || "Balance loading failed."
      );
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchVotes = async (address) => {
    try {
      setIsLoadingVotes(true);

      const [aiVotes, blockchainVotes, gameDevVotes] =
        await Promise.all([
          getVotes(address, 0),
          getVotes(address, 1),
          getVotes(address, 2),
        ]);

      setVotes({
        ai: aiVotes,
        blockchain: blockchainVotes,
        gameDev: gameDevVotes,
      });
    } catch (error) {
      console.error("Vote loading error:", error);

      setStatus(
        error?.message || "Could not load poll results."
      );
    } finally {
      setIsLoadingVotes(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setStatus("");

      const { address } =
        await StellarWalletsKit.authModal();

      if (!address) {
        throw new Error(
          "Wallet address was not returned."
        );
      }

      setWalletAddress(address);
      setStatus("Wallet connected successfully.");

      await fetchBalance(address);
      await fetchVotes(address);
    } catch (error) {
      console.error("Wallet error:", error);

      setStatus(
        error?.message ||
          "Wallet connection failed."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
  setTransactionStatus(
    "Failed: Please select an option before voting."
  );
  setTransactionHash("");
  return;
}

    try {
      setTransactionStatus("Pending...");
      setTransactionHash("");

      const transactionXdr =
        await prepareVoteTransaction(
          walletAddress,
          selectedOption
        );

      const { signedTxXdr } =
        await StellarWalletsKit.signTransaction(
          transactionXdr,
          {
            networkPassphrase: Networks.TESTNET,
            address: walletAddress,
          }
        );

      if (!signedTxXdr) {
        throw new Error(
          "Wallet did not return a signed transaction."
        );
      }

      const result =
        await submitVoteTransaction(
          signedTxXdr
        );

      setTransactionStatus("Success");
      setTransactionHash(result.hash);

      await fetchVotes(walletAddress);
    } catch (error) {
  console.error("Vote error:", error);

  const errorMessage =
    error?.message || "Transaction failed.";

  const lowerError =
    errorMessage.toLowerCase();

  if (
    errorMessage.includes("UnreachableCodeReached") ||
    lowerError.includes("already voted")
  ) {
    setTransactionStatus(
      "Failed: You have already voted in this poll."
    );
  } else if (
    lowerError.includes("reject") ||
    lowerError.includes("decline") ||
    lowerError.includes("cancel")
  ) {
    setTransactionStatus(
      "Failed: Transaction was rejected by the wallet."
    );
  } else {
    setTransactionStatus(
      `Failed: ${errorMessage}`
    );
  }
}
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setBalance(null);

    setVotes({
      ai: 0,
      blockchain: 0,
      gameDev: 0,
    });

    setSelectedOption(null);
    setTransactionStatus("");
    setTransactionHash("");

    setStatus("Wallet disconnected.");
  };

  return (
    <div className="app">
      <h1>Stellar Live Poll</h1>

      <p>Vote on-chain using Stellar Testnet</p>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting
            ? "Connecting..."
            : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <h2>Wallet Connected</h2>

          <p>{walletAddress}</p>

          <h2>XLM Balance</h2>

          <p>
            {isLoadingBalance
              ? "Loading balance..."
              : balance !== null
              ? `${balance} XLM`
              : "Balance unavailable"}
          </p>

          <h2>Live Poll</h2>

          {isLoadingVotes ? (
            <p>Loading poll results...</p>
          ) : (
            <div>
              <label>
                <input
                  type="radio"
                  name="poll"
                  checked={selectedOption === 0}
                  onChange={() =>
                    setSelectedOption(0)
                  }
                />
                🤖 AI — {votes.ai} votes
              </label>

              <br />

              <label>
                <input
                  type="radio"
                  name="poll"
                  checked={selectedOption === 1}
                  onChange={() =>
                    setSelectedOption(1)
                  }
                />
                ⛓️ Blockchain — {votes.blockchain} votes
              </label>

              <br />

              <label>
                <input
                  type="radio"
                  name="poll"
                  checked={selectedOption === 2}
                  onChange={() =>
                    setSelectedOption(2)
                  }
                />
                🎮 Game Development — {votes.gameDev} votes
              </label>

              <br />
              <br />

              <button
                onClick={handleVote}
                disabled={
                  transactionStatus === "Pending..."
                }
              >
                {transactionStatus === "Pending..."
                  ? "Voting..."
                  : "Vote"}
              </button>
            </div>
          )}

          {transactionStatus && (
            <p>
              Transaction: {transactionStatus}
            </p>
          )}

          {transactionHash && (
  <div>
    <p>Transaction Hash:</p>

    <code>{transactionHash}</code>

    <br />
    <br />

    <a
      href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      View on Stellar Explorer
    </a>
  </div>
)}

          <br />

          <button onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}

export default App;