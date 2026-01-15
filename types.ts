export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export enum AppTab {
  INPUT = 'INPUT',
  LOTTERY = 'LOTTERY',
  GROUPING = 'GROUPING'
}
