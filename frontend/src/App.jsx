import { useState } from "react";
import { Networks } from "@stellar/stellar-sdk";

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
      console.error(error);
      setBalance(null);
      setStatus(
        error?.message || "Balance loading failed."
      );
    } finally {
      setIsLoadingBalance(false);
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
      setStatus(
        "Wallet connected successfully."
      );

      await fetchBalance(address);
    } catch (error) {
      console.error(error);

      setStatus(
        error?.message ||
          "Wallet connection failed."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setBalance(null);
    setStatus("Wallet disconnected.");
  };

  return (
    <div className="app">
      <h1>Stellar Live Poll</h1>

      <p>
        Vote on-chain using Stellar Testnet
      </p>

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