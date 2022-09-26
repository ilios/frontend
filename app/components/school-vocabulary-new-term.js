import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

@validatable
export default class SchoolVocabularyNewTermComponent extends Component {
  @service store;
  @service intl;
  @tracked
  @NotBlank()
  @Length(1, 200)
  @Custom('validateTitleCallback', 'validateTitleMessageCallback')
  title;

  save = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    await this.args.createTerm(this.title);
    this.title = null;
  });

  saveOnEnter = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    }
  });

  async validateTitleCallback() {
    const terms = this.args.term
      ? await this.args.term.children
      : await this.args.vocabulary.topLevelTerms;
    return !mapBy(terms.slice(), 'title').includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.term') });
  }
}
