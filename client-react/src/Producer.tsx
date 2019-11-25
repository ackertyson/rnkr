import * as React from 'react';
import { InputEvent, Score } from './types';
import ChannelService from './channel.service';
import ProducerPage from './ProducerPage';

export interface Props {}

export interface State {
  channel: ChannelService;
  contest: string;
  score: Score;
  topic: string;
  username: string;
}

export class Producer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channel: new ChannelService(),
      contest: '',
      score: {},
      topic: '',
      username: 'admin1'
    };

    this.sendCreateContest = this.sendCreateContest.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onScoreChange = this.onScoreChange.bind(this);
    this.updateScore = this.updateScore.bind(this);
    this.createContest = this.createContest.bind(this);
  }

  createContest(): void {
    const contestants = ['A', 'B', 'C', 'D'];
    const name = this.state.contest;
    const topic = `contest:moderator:${name}`;
    this.setState({ topic });
    this.state.channel.open(topic, { username: this.state.username });
    this.sendCreateContest(name, contestants, topic);
  }

  sendCreateContest(name: string, contestants: string[], topic: string): void {
    this.state.channel.send(
      topic, 'create', { name, contestants }, this.onCreateSuccessFor(name)
    );

    this.state.channel.subscribe(
      topic || this.state.topic, 'score_change', this.onScoreChange.bind(this)
    );
  }

  handleInputChange(event: InputEvent): void {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
  }

  onCreateSuccessFor(name: any): () => void {
    return () => console.log(`Created contest '${name}'`);
  }

  onScoreChange(score: Score): void {
    this.state.channel.send(
      this.state.topic, 'get_scores', null, this.updateScore
    );
  }

  render() {
    return (
      <ProducerPage
        createContest={this.createContest}
        onChange={this.handleInputChange}
        score={this.state.score}/>
    );
  }

  updateScore(score: Score) {
    this.setState({ score });
  }
}

export default Producer;
