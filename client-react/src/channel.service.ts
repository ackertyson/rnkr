import * as Phoenix from 'phoenix';
const socketHost = 'ws://localhost:4000/socket';

export class Channel extends Phoenix.Channel {
  // define add'l props on imported type
  topic?: string = '';
}
type ResponseHandler = (response?: any) => any;

export class ChannelService {
  channels: { [key: string]: Channel } = {};
  socket: Phoenix.Socket;

  constructor() {
    const socket = new Phoenix.Socket(socketHost);
    socket.connect();
    this.socket = socket;

    this.open = this.open.bind(this);
    this.send = this.send.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  join(channel: Channel) {
    channel.join()
      .receive('ok', () => {
        console.log(`Joined ${channel.topic} successfully!`);
       })
      .receive('error', (response: any) => {
        console.error(`Unable to join ${channel.topic}:`, response);
       });
  }

  _onError(response: any) {
    console.error('Message failed', response);
  }

  open(topic: string, params = {}) {
    this.channels[topic] = this.socket.channel(topic, params);
    this.join(this.channels[topic]);
    return this.channels[topic];
  }

  send(
    topic: string,
    event: string,
    payload: string | any,
    onData: ResponseHandler,
    onError?: ResponseHandler
  ) {
    if (!this.channels[topic]) {
      throw new Error(`No channel for topic ${topic}`);
    }

    onError = onError || this._onError;
    this.channels[topic].push(event, payload)
      .receive('ok', onData)
      .receive('error', onError);
  }

  subscribe(topic: string, event: string, onData: ResponseHandler) {
    if (!this.channels[topic]) {
      throw new Error(`No channel for topic ${topic}`);
    }

    this.channels[topic].on(event, onData);
    return () => this.channels[topic].off(event);
  }
}

export default ChannelService;
