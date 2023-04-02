const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar,
    ScheduleInfoQuery,
    ScheduleId,
    AccountId,
    Timestamp,
    Transaction
} = require("@hashgraph/sdk");
require('dotenv').config({ path: '.env' });
const account1Id = process.env.ACCOUNT1_ID;
const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT1_PRIVATE_KEY);
const account2Id = process.env.ACCOUNT2_ID;
// If we weren't able to grab it, we should throw a new error
if (account1Id == null ||
    account1PrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}
// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();
client.setOperator(account1Id, account1PrivateKey);
async function createScheduledTransaction(){
        //Create a transaction to schedule
        const transactionToSchedule = new TransferTransaction()
        .addHbarTransfer(account1Id, Hbar.fromTinybars(-10))
        .addHbarTransfer(account2Id, Hbar.fromTinybars(10));
    //Schedule a transaction
    const scheduledtransaction = new ScheduleCreateTransaction()
    .setScheduleMemo("Scheduled Transaction44!")
    .setScheduledTransaction(transactionToSchedule);
    //Sign with the client operator key and submit the transaction to a Hedera network
    const txResponse = await scheduledtransaction.execute(client);
    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID of the schedule transaction is " +scheduleId);
    return scheduleId
}
async function createScheduledTransactionOfBase64(){
    //Create a transaction to schedule
    const transactionToSchedule = new TransferTransaction()
    .addHbarTransfer(account1Id, Hbar.fromTinybars(-10))
    .addHbarTransfer(account2Id, Hbar.fromTinybars(10));
//Schedule a transaction
const scheduledtransaction = new ScheduleCreateTransaction()
.setScheduleMemo("Scheduled Transaction55!")
.setScheduledTransaction(transactionToSchedule);
const transactionBytes = scheduledtransaction.freezeWith(client).toBytes();
const transactionbase64 = Buffer.from(transactionBytes).toString('base64');
return transactionbase64;
}
async function submitTransactionBase64(transactionbase64){
    console.log('Entering submitTransactionBase64 function')
    const decodedTransaction = Buffer.from(transactionbase64, 'base64');
    //const fromTransactionBytes = Transaction.fromBytes(decodedTransaction);
     account1PrivateKey.sign(decodedTransaction);
    const fromTransactionBytes = Transaction.fromBytes(decodedTransaction);
//Sign with the client operator key to pay for the transaction and submit to a Hedera network
const txResponse = await fromTransactionBytes.execute(client);
//Get the receipt of the transaction
const receipt = await txResponse.getReceipt(client);
//Get the transaction status
const transactionStatus = receipt.status;
console.log("The base64 receipt status is " +transactionStatus);
}
async function getInfoAndSubmitSignature(scheduleId){
    const query = new ScheduleInfoQuery()
    .setScheduleId(scheduleId);
//Sign with the client operator private key and submit the query request to a node in a Hedera network
const info = await query.execute(client);
console.log("The scheduledId you queried for is: ", new ScheduleId(info.scheduleId).toString());
console.log("The memo for it is: ", info.scheduleMemo);
console.log("It got created by: ", new AccountId(info.creatorAccountId).toString());
console.log("It got payed by: ", new AccountId(info.payerAccountId).toString());
console.log("The expiration time of the scheduled tx is: ", new Timestamp(info.expirationTime).toDate());
if(new Timestamp(info.executed).toDate().getTime() === new Date("1970-01-01T00:00:00.000Z").getTime()) {
    console.log("The transaction has not been executed yet.");
} else {
    console.log("The time of execution of the scheduled tx is: ", new Timestamp(info.executed).toDate());
}
}
async function main() {
    try{
    const scheduleId = await createScheduledTransaction();
    console.log("The schedule ID of the schedule transaction is " +scheduleId);
   await getInfoAndSubmitSignature(scheduleId);
   const transactionbase64 = await createScheduledTransactionOfBase64();
   await submitTransactionBase64(transactionbase64)
    }catch(err){
        console.log("Error in execute transaction : " + err);
    }
    process.exit();
}
main();