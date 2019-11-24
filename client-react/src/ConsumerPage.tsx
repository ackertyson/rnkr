import * as React from 'react';
import { ButtonHandler, InputHandler, Score } from './types';

export interface Props {
  onChange: InputHandler;
  score: Score;
  contest: string;
  contestants: any;
  username: string;
  joinContest: ButtonHandler;
  castVoteFor: (contestantName: string) => ButtonHandler;
}

export function ConsumerPage(props: Props) {
  const contestants = Object.keys(props.contestants).map(k => {
    return (
      <div key={k}>
        <button type="button" onClick={props.castVoteFor(k)} key={k}>
          Vote for {props.contestants[k]}
        </button>
      </div>
    );
  });

  return (
    <section>
      <h2>Consumer</h2>

      Your name:
      <input type="text"
        name="username"
        defaultValue={props.username}
        onChange={props.onChange}/>

      Contest name:
      <input type="text"
        name="contest"
        defaultValue={props.contest}
        onChange={props.onChange}/>

      <button type="button" onClick={props.joinContest}>Join</button>

      <div>{contestants}</div>
    </section>
  );
}

export default ConsumerPage;
