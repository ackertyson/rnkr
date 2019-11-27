import * as React from 'react';
import { ButtonHandler, InputHandler, Score } from './types';

export interface Props {
  createContest: ButtonHandler;
  onChange: InputHandler;
  score: Score;
}

export function ProducerPage(props: Props) {
  const scores = Object.keys(props.score).map(k => {
    return (<li key={k}>{k}: {props.score[k]}</li>);
  });

  return (
    <section>
      <h2>Moderator</h2>

      <div className="form-group">
        <label>Contest name</label>
        <input type="text"
          name="contest"
          onChange={props.onChange}/>
      </div>
      <button type="button" onClick={props.createContest}>
        Create contest
      </button>

      {scores.length > 0 && <div>
        <h2>Scores</h2>
        <ul>
          {scores}
        </ul>
      </div>}
    </section>
  );
}

export default ProducerPage;
