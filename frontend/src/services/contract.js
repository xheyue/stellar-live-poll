import {
  BASE_FEE,
  Contract,
  Horizon,
  Networks,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc as StellarRpc,
} from "@stellar/stellar-sdk";

const CONTRACT_ID =
  "CAKRUL2B26CLC3G2PGU6BQBCSUSDMXKWKCWAZUOGXEJPOZUQHQWRE25Z";

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

export async function prepareVoteTransaction(
  walletAddress,
  option
) {
  const account = await horizonServer.loadAccount(
    walletAddress
  );

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        "vote",
        nativeToScVal(walletAddress, {
          type: "address",
        }),
        nativeToScVal(option, {
          type: "u32",
        })
      )
    )
    .setTimeout(180)
    .build();

  const preparedTransaction =
    await rpcServer.prepareTransaction(transaction);

  return preparedTransaction.toXDR();
}

export async function submitVoteTransaction(
  signedTransactionXdr
) {
  const transaction = new Transaction(
    signedTransactionXdr,
    Networks.TESTNET
  );

  const response =
    await rpcServer.sendTransaction(transaction);

  console.log("Send transaction response:", response);

  if (response.status !== "PENDING") {
    throw new Error(
      `Transaction could not be submitted. Status: ${response.status}`
    );
  }

  const hash = response.hash;

  const result = await rpcServer.pollTransaction(
    hash,
    {
      sleepStrategy: () => 1000,
      attempts: 15,
    }
  );

  console.log("Final transaction result:", result);

  if (result.status !== "SUCCESS") {
    throw new Error(
      `Transaction failed. Status: ${result.status}`
    );
  }

  return {
    hash,
    result,
  };
}