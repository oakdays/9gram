export enum Action {
  None,
  Insert,
  Mark,
}

export enum CellState {
  Empty,
  Active,
  Marked,
}

export enum ActionEffect {
  None,
  Inserting,
  Removing,
}

export enum MouseButton {
  Left = 0,
  Right = 2,
}
