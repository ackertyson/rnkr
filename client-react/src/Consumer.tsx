import * as React from 'react';
import ChannelService from './channel.service';
import ConsumerPage from './ConsumerPage';
import { ButtonHandler, InputEvent, FormContainer, Score } from './types';

export interface Props {}

export interface State {
  active: boolean;
  channel: ChannelService;
  contest: string;
  contestants: {[key: string]: string};
  score: Score;
  subscriptions: Function[];
  topic: string;
  username: string;
}

export class Consumer extends React.Component<Props, State> implements FormContainer {
  constructor(props: Props) {
    super(props);
    this.state = {
      active: false,
      channel: new ChannelService(),
      contest: '',
      contestants: {},
      score: {},
      subscriptions: [],
      topic: '',
      username: ''
    };

    this.castVoteFor = this.castVoteFor.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.joinContest = this.joinContest.bind(this);
    this.onError = this.onError.bind(this);
    this.onVotingComplete = this.onVotingComplete.bind(this);
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
    return () => this.state.channel.send(
      this.state.topic, 'get_contestants', null, this.setContestants
    );
  }

  handleInputChange(event: InputEvent): void {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
  }

  joinContest(): void {
    if (!this.state.contest) throw new Error('Enter a contest name!');
    if (!this.state.username) throw new Error('Enter your name!');
    const topic = `contest:voter:${this.state.contest}`;
    this.setState({ active: true, topic });

    this.state.channel.open(topic, { username: this.state.username });
    this.state.channel.subscribe(
      topic, 'voting_complete', this.onVotingComplete.bind(this)
    );
    this.state.channel.send(topic, 'get_contestants', null, this.setContestants, this.onError);
  }

  onError(error: any) {
    console.error(error);
  }

  onVotingComplete(): void {
    this.setState({ active: false });
  }

  render() {
    return (
      <ConsumerPage
        active={this.state.active}
        castVoteFor={this.castVoteFor}
        contest={this.state.contest}
        contestants={this.state.contestants}
        joinContest={this.joinContest}
        onChange={this.handleInputChange}
        score={this.state.score}
        username={this.state.username}/>
    );
  }

  setContestants(contestants: any) {
    this.setState({ contestants });
  }
}

export default Consumer;
