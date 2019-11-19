import * as React from 'react';
import { ButtonHandler } from './types';
import ChannelService from './channel.service';
import ProducerPage from './ProducerPage';

export interface Props {}

export interface State {
  channel: ChannelService;
  topic: string;
  username: string;
}

export class Producer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channel: new ChannelService(),
      topic: '',
      username: 'admin1'
    };

    this.addPointFor = this.addPointFor.bind(this);
    this.createGame = this.createGame.bind(this);
    this.selectTeams = this.selectTeams.bind(this);
  }

  addPointFor(name: string): ButtonHandler {
    return () => this.state.channel.send(
      this.state.topic, 'add_score', { name: name }, this.onAddPointSuccessFor(name)
    );
  }

  createGame(name: string, contestants: string[], topic: string): void {
    this.state.channel.send(
      topic, 'create', { name, contestants }, this.onCreateSuccessFor(name)
    );
  }

  onAddPointSuccessFor(name: string): () => void {
    return () => console.log(`Added point for ${name}`);
  }

  onCreateSuccessFor(name: any): () => void {
    return () => console.log(`Created contest '${name}'`);
  }

  render() {
    return (
      <ProducerPage
        addPointFor={this.addPointFor}
        selectTeams={this.selectTeams}/>
    );
  }

  selectTeams(): void {
    const contestants = ['A', 'B', 'C', 'D'];
    const topic = 'contest:moderator:mine';
    const name = 'mine';
    this.setState({ topic });
    this.state.channel.open(topic, { username: this.state.username });
    this.createGame(name, contestants, topic);
  }
}

export default Producer;
