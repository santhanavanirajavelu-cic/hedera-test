
console.clear();
const {
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config({ path: '.env' });

// Grab the Account1Id and Account1Key from the .env file
const myAccountId = process.env.ACCOUNT1_ID;
const myPrivateKey = process.env.ACCOUNT1_PRIVATE_KEY;

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the Account1 ID and Account1 key
client.setOperator(myAccountId, myPrivateKey);

async function main() {
    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`The topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    //Create the query
    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            let messageAsString = Buffer.from(message.contents, "utf8").toString();
            console.log(
                `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
            );
        });

    // Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "My First Message!",
    }).execute(client);
    const getReceipt = await sendResponse.getReceipt(client);

    //Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus);
}

main();