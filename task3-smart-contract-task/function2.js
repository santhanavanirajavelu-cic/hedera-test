const {
    Client,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    PrivateKey,
    ContractId,
} = require("@hashgraph/sdk");
require('dotenv').config({ path: '.env' });

console.log(process.env.ACCOUNT1_ID);
console.log(process.env.ACCOUNT1_PRIVATE_KEY);

const account1Id = process.env.ACCOUNT1_ID;
const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);

// Throw error if not set
if (account1Id == null || account1PrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Connection to Hedera network
const client = Client.forTestnet();

client.setOperator(account1Id, account1PrivateKey);

async function main() {
    const contractId = ContractId.fromString(process.env.CONTRACT_ID);
    console.log("The smart contract ID is " + contractId);

    //Create the transaction to update the contract message
    const contractExecTx = await new ContractExecuteTransaction()
        //Set the ID of the contract
        .setContractId(contractId)
        //Set the gas for the contract call
        .setGas(100000)
        //Set the contract function to call
        //Pass the function 1 result
        .setFunction("function2", new ContractFunctionParameters().addUint16(12));

    //Submit the transaction to a Hedera network and store the response
    const submitExecTx = await contractExecTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await submitExecTx.getReceipt(client);

    //Confirm the transaction was executed successfully
    console.log("The transaction status is " + receipt.status.toString());

    // a record contains the output of the function
    const record = await submitExecTx.getRecord(client);

    console.log("The function 2 output is " + record.contractFunctionResult?.getUint160());

    process.exit();
}

main();