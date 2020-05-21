import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  //? means to tell TS that this vaar may be undefined for a while... until we intialize the class

  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('cannot access NATS before connecting');
    }
    return this._client;
  }
  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}
// we are not calling constructor inside teh class bc we are initializing the class and calling the
// constructor in the below new once we import it into the index . ts file
export const natsWrapper = new NatsWrapper();
