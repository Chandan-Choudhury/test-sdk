const conn = require("../dist/connection");
const balances = require("../dist/balance");
const token = require("../dist/token");

let did = "did:ssid:givewac";
let did2 = "did:ssid:insurance";


async function main() {
  let api = await conn.buildConnection("testnet");
  let sub = new balances.Subscription(api, did);
  await sub.start((bal) => {
    // console.log("givewac", bal)
  });
  // await sub.stop();

  let sub2 = new balances.Subscription(api, did2, true);
  await sub2.start((bal) => {
    // console.log("insurance", bal)
  });

  sub.stop();

  let sub3 = new token.Subscription(api, did, "TLARI");
  await sub3.start((bal) => {
    // console.log("givewac", bal)
  });

  sub2.stop();

};

main();