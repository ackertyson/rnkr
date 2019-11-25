import * as React from 'react';
import { ButtonHandler, InputHandler, Score } from './types';

export interface Props {
  active: boolean;
  castVoteFor: (contestantName: string) => ButtonHandler;
  contest: string;
  contestants: any;
  joinContest: ButtonHandler;
  onChange: InputHandler;
  score: Score;
  username: string;
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

      <div>
        Your name:
        <input type="text"
          name="username"
          defaultValue={props.username}
          onChange={props.onChange}/>
      </div>

      <div>
        Contest name:
        <input type="text"
          name="contest"
          defaultValue={props.contest}
          onChange={props.onChange}/>
      </div>

      <button type="button" onClick={props.joinContest}>Join</button>

      <div>{props.active && contestants}</div>
      {props.active || <p>No active contest; join one to begin</p>}
    </section>
  );
}

export default ConsumerPage;
