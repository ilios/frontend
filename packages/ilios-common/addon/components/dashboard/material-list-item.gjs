import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import UserMaterialStatus from 'ilios-common/components/user-material-status';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import TimedReleaseSchedule from 'ilios-common/components/timed-release-schedule';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';
import lmType from 'ilios-common/helpers/lm-type';
import eq from 'ember-truth-helpers/helpers/eq';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import TruncateText from 'ilios-common/components/truncate-text';
import join from 'ilios-common/helpers/join';
import sortBy from 'ilios-common/helpers/sort-by';
import formatDate from 'ember-intl/helpers/format-date';

export default class DashboardMaterialListItemComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  @action
  sortString(a, b) {
    return a.localeCompare(b);
  }
  <template>
    <tr data-test-learning-material>
      <td colspan="2">
        <UserMaterialStatus @learningMaterial={{@lm}} />
      </td>
      <td id="{{this.uniqueId}}-title" colspan="6" data-test-title>
        {{#if @lm.isBlanked}}
          <span class="lm-type-icon">
            <FaIcon @icon="clock" @title={{t "general.timedRelease"}} data-test-is-blanked />
          </span>
          {{@lm.title}}
          <span class="timed-release-info">
            <TimedReleaseSchedule @endDate={{@lm.endDate}} @startDate={{@lm.startDate}} />
          </span>
        {{else}}
          <LmTypeIcon @mimetype={{@lm.mimetype}} @type={{lmType @lm}} />
          {{#if @lm.absoluteFileUri}}
            {{#if (eq @lm.mimetype "application/pdf")}}
              <a href="{{@lm.absoluteFileUri}}?inline" data-test-pdf-link>
                {{@lm.title}}
              </a>
              <a
                aria-labelledby="{{this.uniqueId}}-title"
                href={{@lm.absoluteFileUri}}
                rel="noopener noreferrer"
                target="_blank"
                data-test-pdf-download-link
              >
                <FaIcon
                  aria-label={{t "general.download"}}
                  @icon="download"
                  @title={{t "general.download"}}
                />
              </a>
            {{else}}
              <a
                href={{@lm.absoluteFileUri}}
                rel="noopener noreferrer"
                target="_blank"
                data-test-file-link
              >
                {{@lm.title}}
              </a>
            {{/if}}
          {{else if @lm.link}}
            <a href={{@lm.link}} rel="noopener noreferrer" target="_blank" data-test-link>
              {{@lm.title}}
            </a>
          {{else}}
            {{@lm.title}}
            <br />
            <small>
              {{@lm.citation}}
            </small>
          {{/if}}
        {{/if}}
      </td>
      <td class="hide-from-small-screen" colspan="6" data-test-session-title>
        {{@lm.sessionTitle}}
      </td>
      <td class="hide-from-small-screen" colspan="6" data-test-course-title>
        {{@lm.courseTitle}}
      </td>
      <td class="hide-from-large-screen" colspan="6" data-test-course-session-title>
        {{#if (isEmpty @lm.sessionTitle)}}
          {{@lm.courseTitle}}
        {{else}}
          {{@lm.courseTitle}}
          ::
          {{@lm.sessionTitle}}
        {{/if}}
      </td>
      <td class="hide-from-small-screen" colspan="3" data-test-instructors>
        <TruncateText @length={{25}} @text={{join ", " (sortBy this.sortString @lm.instructors)}} />
      </td>
      <td colspan="4" data-test-date>
        {{#if @lm.firstOfferingDate}}
          {{formatDate @lm.firstOfferingDate day="2-digit" month="2-digit" year="numeric"}}
        {{else}}
          {{t "general.none"}}
        {{/if}}
      </td>
    </tr>
  </template>
}
