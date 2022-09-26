import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';

@validatable
export default class SchoolNewVocabularyFormComponent extends Component {
  @service intl;
  @service store;
  @tracked
  @NotBlank()
  @Length(1, 200)
  @Custom('validateTitleCallback', 'validateTitleMessageCallback')
  title;

  saveNew = dropTask(async () => {
    this.addErrorDisplaysFor(['title']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    await this.args.save.linked().perform(this.title, this.args.school, true);
    this.clearErrorDisplay();
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveNew.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.close();
    }
  });

  async validateTitleCallback() {
    const allVocabsInSchool = await this.args.school.vocabularies;
    const titles = mapBy(allVocabsInSchool.slice(), 'title');
    return !titles.includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.vocabulary') });
  }
}
