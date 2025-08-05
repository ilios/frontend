import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import HtmlEditor from 'ilios-common/components/html-editor';
import or from 'ember-truth-helpers/helpers/or';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import striptags from 'striptags';

export default class NewObjectiveComponent extends Component {
  @service intl;
  @tracked title;

  validations = new YupValidations(this, {
    titleWithoutMarkup: string().trim().min(3).max(65000),
  });

  get titleWithoutMarkup() {
    return striptags(this.title ?? '').replace(/&nbsp;/gi, '');
  }

  saveObjective = dropTask(async () => {
    this.validations.addErrorDisplayFor('titleWithoutMarkup');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('titleWithoutMarkup');
    await this.args.save(this.title);
    this.title = null;
  });

  @action
  changeTitle(contents) {
    this.validations.addErrorDisplayFor('titleWithoutMarkup');
    this.title = contents;
  }
  <template>
    <section class="new-objective" data-test-new-objective>
      <h3 class="title" data-test-title>{{t "general.newObjective"}}</h3>
      <div class="new-objective-form" data-test-description>
        <label class="form-label" data-test-description-label>
          {{t "general.description"}}:
        </label>
        <HtmlEditor @content={{this.title}} @update={{this.changeTitle}} @autofocus={{true}} />
        <YupValidationMessage
          @description={{t "general.description"}}
          @validationErrors={{this.validations.errors.titleWithoutMarkup}}
          data-test-description-validation-error-message
        />
        <div class="buttons">
          <button
            disabled={{or this.saveObjective.isRunning}}
            class="done text"
            type="button"
            {{on "click" (perform this.saveObjective)}}
            data-test-save
          >
            {{#if this.saveObjective.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button class="cancel text" type="button" {{on "click" @cancel}} data-test-cancel>
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    </section>
  </template>
}
