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
      <h2>Producer</h2>

      <div>
        Contest name:
        <input type="text"
          name="contest"
          onChange={props.onChange}/>
      </div>
      <button type="button" onClick={props.createContest}>
        Create contest
      </button>

      <h2>Scores</h2>
      <ul>
        {scores}
      </ul>
    </section>
  );
}

export default ProducerPage;
