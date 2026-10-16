import { instrumentAppInstancePerformance } from '@sentry/ember';

export function initialize(owner) {
  instrumentAppInstancePerformance(owner);
}

export default {
  initialize,
};
