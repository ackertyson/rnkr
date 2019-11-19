import * as React from 'react';
import { ButtonHandler, InputHandler, Score } from './types';

export interface Props {
  onChange: InputHandler;
  score: Score;
  username: string;
  selectGame: ButtonHandler;
}

export function ConsumerPage(props: Props) {
  return (
    <section>
      <h2>Consumer</h2>

      Username:
      <input type="text"
        name="username"
        defaultValue={props.username}
        onChange={props.onChange}/>

      <button type="button" onClick={props.selectGame}>
        Watch
      </button>
      <ul>
        {props.score && <li>Twins: {props.score.Twins}</li>}
        {props.score && <li>Mets: {props.score.Mets}</li>}
      </ul>
    </section>
  );
}

export default ConsumerPage;
