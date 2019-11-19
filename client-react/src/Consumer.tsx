import * as React from 'react';
import ChannelService from './channel.service';
import ConsumerPage from './ConsumerPage';
import { InputEvent, FormContainer, Score } from './types';

export interface Props {}

export interface State {
  channel: ChannelService;
  score: Score,
  subscriptions: Function[],
  topic: string;
  username: string;
}

export class Consumer extends React.Component<Props, State> implements FormContainer {
  constructor(props: Props) {
    super(props);
    this.state = {
      channel: new ChannelService(),
      score: {},
      subscriptions: [],
      topic: 'contest:consumer:mine',
      username: ''
    };

    this.getScore = this.getScore.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onScoreUpdate = this.onScoreUpdate.bind(this);
    this.watchGame = this.watchGame.bind(this);
    this.selectGame = this.selectGame.bind(this);
  }

  componentWillUnmount() {
    this.state.subscriptions.forEach((unsub: Function) => unsub());
  }

  getScore(): void {
    this.state.channel.send(
      this.state.topic, 'get_score', null, this.onScoreUpdate.bind(this)
    );
  }

  handleInputChange(event: InputEvent): void {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
  }

  onScoreUpdate(score: Score): void {
    this.setState({ score });
  }

  render() {
    return (
      <ConsumerPage
        onChange={this.handleInputChange}
        score={this.state.score}
        username={this.state.username}
        selectGame={this.selectGame}/>
    );
  }

  selectGame(): void {
    if (!this.state.username) throw new Error('Sign in first!');

    this.setState({ score: { 'Twins': 0, 'Mets': 0 } });
    this.state.channel.open(this.state.topic, { username: this.state.username });
    this.watchGame();
  }

  watchGame(): void {
    const unsubscribe = this.state.channel.subscribe(
      this.state.topic, 'score_change', this.getScore.bind(this)
    );
    this.state.subscriptions.push(unsubscribe);
    this.getScore();
  }
}

export default Consumer;
