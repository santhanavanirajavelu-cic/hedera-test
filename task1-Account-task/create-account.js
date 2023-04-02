const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
  } = require("@hashgraph/sdk");
  require("dotenv").config({ path: '.env' });
  console.log(process.env.CLIENT_ID, process.env.CLIENT_PRIVATE_KEY)
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.CLIENT_ID;
  const myPrivateKey = process.env.CLIENT_PRIVATE_KEY;

  const noOfAccounts = 5;
  console.log("No of accounts to create: " + noOfAccounts + "\n");

  async function createAccount(count) {
    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null || myPrivateKey == null) {
      throw new Error(
        "Environment variables myAccountId and myPrivateKey must be present"
      );
    }
  
    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();
  
    client.setOperator(myAccountId, myPrivateKey);
  
    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(new Hbar(600))
      .execute(client);
  
    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;  
    console.log("Account id " + count + " is " + newAccountId);
    console.log("Private Key :" + newAccountPrivateKey);
    console.log("Public Key :" + newAccountPublicKey);
  }
  async function main() {
    for (let i = 0; i < noOfAccounts; i++) {
      await createAccount(i + 1);
    }
    process.exit();
  }
  main();
  