import {
  BASE_FEE,
  Contract,
  Horizon,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc as StellarRpc,
} from "@stellar/stellar-sdk";

const CONTRACT_ID =
  "CAHQ4QLVWOXPC2VSED476UGL6R4SSJ6DLF5CGGI6HOVSXMT7G7XUSU7W";

const horizonServer = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const rpcServer = new StellarRpc.Server(
  "https://soroban-testnet.stellar.org"
);

const contract = new Contract(CONTRACT_ID);

export async function getVotes(walletAddress, option) {
  const account = await horizonServer.loadAccount(walletAddress);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        "get_votes",
        nativeToScVal(option, { type: "u32" })
      )
    )
    .setTimeout(30)
    .build();

  const simulation =
    await rpcServer.simulateTransaction(transaction);

  if (StellarRpc.Api.isSimulationError(simulation)) {
    throw new Error(
      simulation.error || "Contract simulation failed."
    );
  }

  if (!simulation.result) {
    throw new Error("Contract did not return a result.");
  }

  return Number(
    scValToNative(simulation.result.retval)
  );
}