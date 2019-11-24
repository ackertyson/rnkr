import * as React from 'react';
import ChannelService from './channel.service';
import ConsumerPage from './ConsumerPage';
import { ButtonHandler, InputEvent, FormContainer, Score } from './types';

export interface Props {}

export interface State {
  channel: ChannelService;
  score: Score;
  subscriptions: Function[];
  topic: string;
  contest: string;
  contestants: {[key: string]: string};
  username: string;
}

export class Consumer extends React.Component<Props, State> implements FormContainer {
  constructor(props: Props) {
    super(props);
    this.state = {
      channel: new ChannelService(),
      score: {},
      subscriptions: [],
      topic: '',
      contest: '',
      contestants: {},
      username: ''
    };

    this.castVoteFor = this.castVoteFor.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.joinContest = this.joinContest.bind(this);
    this.onGetContestants = this.onGetContestants.bind(this);
    this.setContestants = this.setContestants.bind(this);
  }

  componentWillUnmount() {
    this.state.subscriptions.forEach((unsub: Function) => unsub());
  }

  castVoteFor(name: string): ButtonHandler {
    return () => this.state.channel.send(
      this.state.topic, 'cast_vote', { name: name }, this.onCastVoteSuccessFor(name)
    );
  }

  onCastVoteSuccessFor(name: string): () => void {
    // return () => console.log(`Cast vote for ${name}`);
    return () => this.state.channel.send(
      this.state.topic, 'get_contestants', null, this.onGetContestants
    );
  }

  onGetContestants(contestants: any): void {
    this.setState({ contestants });
  }

  handleInputChange(event: InputEvent): void {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
  }

  joinContest(): void {
    if (!this.state.contest) throw new Error('Enter a contest name!');
    if (!this.state.username) throw new Error('Enter your name!');
    const topic = `contest:voter:${this.state.contest}`;
    this.setState({ topic });

    this.state.channel.open(topic, { username: this.state.username });
    this.state.channel.send(topic, 'get_contestants', null, this.setContestants);
  }

  render() {
    return (
      <ConsumerPage
        onChange={this.handleInputChange}
        score={this.state.score}
        contest={this.state.contest}
        contestants={this.state.contestants}
        username={this.state.username}
        joinContest={this.joinContest}
        castVoteFor={this.castVoteFor}/>
    );
  }

  setContestants(contestants: any) {
    this.setState({ contestants });
  }
}

export default Consumer;
