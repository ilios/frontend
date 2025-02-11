import { registerDeprecationHandler } from '@ember/debug';
import config from './config/environment';

const SHOULD_THROW = config.environment !== 'production';

const SILENCED_DEPRECATIONS = [
  // Add ids of deprecations we temporarily want to silence here.
];

registerDeprecationHandler((message, options, next) => {
  if (SILENCED_DEPRECATIONS.includes(options.id)) {
    return;
  } else if (SHOULD_THROW) {
    throw new Error(`Deprecation:  ${message} ++++ ID: ${options.id}`);
  }

  next(message, options);
});
