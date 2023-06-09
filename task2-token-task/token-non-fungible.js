const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    AccountBalanceQuery,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar
} = require("@hashgraph/sdk");
require('dotenv').config({ path: '.env' });

const myAccountId = process.env.ACCOUNT1_ID;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);


const account2 = process.env.ACCOUNT2_ID;
const myPrivateKey2 = PrivateKey.fromString(process.env.ACCOUNT2_PRIVATE_KEY);

// If we weren't able to grab it, we should throw a new error
if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create the NFT
    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Best Event Ticket Ever")
        .setTokenSymbol("BETE")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(myAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(5)
        .setSupplyKey(myPrivateKey)
        .freezeWith(client);

    //Sign the transaction with the treasury key
    let nftCreateTxSign = await nftCreate.sign(myPrivateKey);

    //Submit the transaction to a Hedera network
    let nftCreateSubmit = await nftCreateTxSign.execute(client);

    //Get the transaction receipt
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);

    //Get the token ID
    let tokenId = nftCreateRx.tokenId;

    //Log the token ID
    console.log(`- Created NFT with Token ID: ${tokenId} \n`);

    const balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);

    console.log(`- User balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(1)
        .setDenominator(10)
        .setFeeCollectorAccountId(account2)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));
    process.exit();
}

main();
