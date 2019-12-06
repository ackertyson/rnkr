import * as React from 'react';
import { ButtonHandler, InputHandler, Score } from './types';

export interface Props {
  active: boolean;
  castVoteFor: (contestantName: string) => ButtonHandler;
  contest: string;
  contestants: any;
  isBusy: boolean;
  joinContest: ButtonHandler;
  onChange: InputHandler;
  score: Score;
  status: string;
  username: string;
}

export function ConsumerPage(props: Props) {
  const contestants = Object.keys(props.contestants).map(k => {
    return (
      <div className="form-group" key={k}>
        <button type="button" className="primary" onClick={props.castVoteFor(k)} key={k}>
          {props.contestants[k]}
        </button>
      </div>
    );
  });

  return (
    <section>
      {props.active || <div>
        <div className="form-group">
          <label>Your name</label>
          <input type="text"
            name="username"
            defaultValue={props.username}
            onChange={props.onChange}/>
        </div>

        <div className="form-group">
          <label>Contest name</label>
          <input type="text"
            name="contest"
            defaultValue={props.contest}
            onChange={props.onChange}/>
        </div>

        <button type="button" onClick={props.joinContest}>Join</button>
      </div>}


      {props.active && <div>
        <h2>{props.contest}</h2>
        <h4>Which is better?</h4>
        {props.isBusy &&
          <h3 className="spinner">JUST WAIT OKAY</h3>}
        {props.isBusy || contestants}
      </div>}
      <h4 className="status">{props.status}</h4>
    </section>
  );
}

export default ConsumerPage;
