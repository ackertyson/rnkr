import * as React from 'react';

export type ButtonEvent = React.MouseEvent<HTMLButtonElement>;
export type ButtonHandler = (e: ButtonEvent) => void;

export type InputEvent = React.ChangeEvent<HTMLInputElement>;
export type InputHandler = (e: InputEvent) => void;

export interface FormContainer {
  handleInputChange: InputHandler;
}

export type Score = { [key: string]: number };
