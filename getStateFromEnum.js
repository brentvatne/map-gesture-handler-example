import { State } from 'react-native-gesture-handler';

export default function getStateFromEnum(s) {
  switch (s) {
    case State.UNDETERMINED:
      return 'UNDETERMINED';
    case State.BEGAN:
      return 'BEGAN';
    case State.FAILED:
      return 'FAILED';
    case State.CANCELLED:
      return 'CANCELLED';
    case State.ACTIVE:
      return 'ACTIVE';
    case State.END:
      return 'END';
    default:
      return `Invalid gesture state: ${s}`;
  }
}