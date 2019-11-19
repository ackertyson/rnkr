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
      this.state.topic, 'add_point', { team: name }, this.onAddPointSuccessFor(name)
    );
  }

  createGame(teams: any, topic: string): void {
    this.state.channel.send(
      topic, 'new_match', teams, this.onCreateSuccessFor(teams)
    );
  }

  onAddPointSuccessFor(name: string): () => void {
    return () => console.log(`Added point for ${name}`);
  }

  onCreateSuccessFor(teams: any): () => void {
    return () => console.log(`Created match for ${teams.teamA} + ${teams.teamB}`);
  }

  render() {
    return (
      <ProducerPage
        addPointFor={this.addPointFor}
        selectTeams={this.selectTeams}/>
    );
  }

  selectTeams(): void {
    const teams = { teamA: 'Twins', teamB: 'Mets', sport: 'Baseball' };
    const topic = 'match:Twins+Mets';
    this.setState({ topic });
    this.state.channel.open(topic, { username: this.state.username });
    this.createGame(teams, topic);
  }
}

export default Producer;
