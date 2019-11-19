import * as React from 'react';
import { ButtonHandler } from './types';

export interface Props {
  addPointFor: (teamName: string) => ButtonHandler;
  selectTeams: ButtonHandler;
}

export function ProducerPage(props: Props) {
  return (
    <section>
      <h2>Producer</h2>

      <button type="button" onClick={props.selectTeams}>
        New game
      </button>
      <button type="button" onClick={props.addPointFor('Twins')}>
        Add point (Twins)
      </button>
      <button type="button" onClick={props.addPointFor('Mets')}>
        Add point (Mets)
      </button>
    </section>
  );
}

export default ProducerPage;
