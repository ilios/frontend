import { FlashMessagesService } from 'ember-cli-flash';
import { isTesting } from '@embroider/macros';

/**
 * Extend the service so we can configure it.
 */
export default class IliosFlashMessages extends FlashMessagesService {
  get flashMessageDefaults() {
    return {
      ...super.flashMessageDefaults,
      timeout: isTesting() ? 100 : 3000,
      extendedTimeout: isTesting() ? 100 : 1000,
      types: ['success', 'warning', 'info', 'alert'],
    };
  }
}
