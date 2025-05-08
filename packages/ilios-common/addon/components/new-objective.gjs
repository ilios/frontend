import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import t from 'ember-intl/helpers/t';
import HtmlEditor from 'ilios-common/components/html-editor';
import ValidationError from 'ilios-common/components/validation-error';
import or from 'ember-truth-helpers/helpers/or';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

@validatable
export default class NewObjectiveComponent extends Component {
  @HtmlNotBlank() @Length(3, 65000) @tracked title;

  saveObjective = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    await this.args.save(this.title);
    this.title = null;
  });

  @action
  changeTitle(contents) {
    this.addErrorDisplayFor('title');
    this.title = contents;
  }
  <template>
    <section class="new-objective">
      <h4 class="title">{{t "general.newObjective"}}</h4>
      <div class="new-objective-form">
        <label class="form-label">
          {{t "general.description"}}:
        </label>
        <HtmlEditor @content={{this.title}} @update={{this.changeTitle}} @autofocus={{true}} />
        <ValidationError @validatable={{this}} @property="title" />
        <div class="buttons">
          <button
            disabled={{or this.saveObjective.isRunning}}
            class="done text"
            type="button"
            {{on "click" (perform this.saveObjective)}}
          >
            {{#if this.saveObjective.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button class="cancel text" type="button" {{on "click" @cancel}}>
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    </section>
  </template>
}
