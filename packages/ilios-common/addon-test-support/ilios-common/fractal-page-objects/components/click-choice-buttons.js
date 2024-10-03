import { PageObject, selector } from 'fractal-page-object';

class ClickChoiceButtons extends PageObject {
  firstButton = selector('[data-test-first-button]');
  secondButton = selector('[data-test-second-button]');
}

export default ClickChoiceButtons;
export const component = new ClickChoiceButtons();
