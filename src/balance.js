const { buildConnection } = require('./connection.js');
const { sanitiseDid } = require('./did.js');

class Subscription {

  constructor(api, did, detailed = false) {
    this._api = api;
    this._did = did;
    this._subscribed = false;
    this._detailed = detailed;
  }

  async subscribe(callback) {
    if (this._subscribed) {
      return;
    }
    this._subscribed = true;
    if(this._detailed) {
      await this._api.query.did.account(sanitiseDid(this._did), (balance) => {
        if (this._subscribed) {
          console.log(this._did, (balance.toJSON())['data']);
          callback((balance.toJSON())['data']);
        }
      });
    } else {
      await this._api.query.did.account(sanitiseDid(this._did), (balance) => {
        if (this._subscribed) {
          console.log(this._did, (balance.toJSON())['data'].free / 10 ** 6);
          callback((balance.toJSON())['data'].free / 10 ** 6);
        }
      });
    }
  }

  unsubscribe() {
    if (!this._subscribed) {
      return;
    }
    this._subscribed = false;
  }

  async start(callback) {
    console.log('Subscribing to balance', this._did);
    await this.subscribe(callback);
  }

  stop() {
    console.log('Unsubscribing to balance', this._did);
    this.unsubscribe();
  }

}

/**
 * Get account balance(Highest Form) based on the did supplied.
 * @param {String} did Identifier of the user
 * @param {ApiPromse=} api Api Object from Build Connection
 * @returns {String} Balance In Highest Form
 * @example await getBalanceFromDID(did, api)
 */
const getBalance = async (did, api = false) => {
  // Resolve the did to get account ID
  try {
    const provider = api || await buildConnection('local');
    const did_hex = sanitiseDid(did);
    const token = (await provider.rpc.system.properties()).toHuman();
    // const tokenData = token.toHuman();
    let decimals = Number(token['tokenDecimals'][0]);
    const accountInfo = (await provider.query.did.account(did_hex)).toJSON();
    const data = accountInfo['data'];
    const free = data['free'] / Math.pow(10, decimals);
    return free;
  } catch (err) {
    console.log(err);
    return null;
  }
};
/**
 * Listen to balance changes for a DID and execute the callback.
 * @param {String} identifier DID
 * @param {Function} callback Cb function to execute with new balance in Highest Form
 * @param {ApiPromise=} api Api Object from Build Connection
 */
const subscribeToBalanceChanges = async (identifier, callback, api = false) => {
  try {
    const provider = api || await buildConnection('local');
    const token = (await provider.rpc.system.properties()).toHuman();
    let decimals = Number(token['tokenDecimals'][0]);
    const did_hex = sanitiseDid(identifier);
    return  provider.query.did.account(did_hex, ({ data: { free: currentBalance } }) => {
      callback(currentBalance.toNumber() / Math.pow(10, decimals));
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = {
  getBalance,
  subscribeToBalanceChanges,
  Subscription,
};
