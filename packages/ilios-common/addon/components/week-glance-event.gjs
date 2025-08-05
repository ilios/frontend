import Component from '@glimmer/component';
import createTypedLearningMaterialProxy from 'ilios-common/utils/create-typed-learning-material-proxy';
import { concat } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import OfferingUrlDisplay from 'ilios-common/components/offering-url-display';
import FaIcon from 'ilios-common/components/fa-icon';
import join from 'ilios-common/helpers/join';
import sortBy from 'ilios-common/helpers/sort-by';
import TruncateText from 'ilios-common/components/truncate-text';
import or from 'ember-truth-helpers/helpers/or';
import LearningMaterialList from 'ilios-common/components/week-glance/learning-material-list';

export default class WeekGlanceEvent extends Component {
  sortString(a, b) {
    return a.localeCompare(b);
  }
  get sessionLearningMaterials() {
    const lms =
      this.args.event.learningMaterials?.filter((lm) => Boolean(lm.sessionLearningMaterial)) ?? [];
    return this.getTypedLearningMaterialProxies(lms);
  }

  get preworkEvents() {
    if (!this.args.event.prerequisites) {
      return [];
    }
    return this.args.event.prerequisites.map((ev) => {
      const rhett = {
        name: ev.name,
        slug: ev.slug,
        learningMaterials: [],
        isPublished: ev.isPublished,
      };
      rhett.learningMaterials = this.getTypedLearningMaterialProxies(ev.learningMaterials)
        .filter((lm) => Boolean(lm.sessionLearningMaterial))
        .sort(this.sessionLearningMaterialSortingCalling);
      return rhett;
    });
  }

  getTypedLearningMaterialProxies(learningMaterials) {
    const lms = learningMaterials || [];
    return lms.map((lm) => {
      return createTypedLearningMaterialProxy(lm);
    });
  }

  sessionLearningMaterialSortingCalling(lm1, lm2) {
    const pos1 = Number(lm1.position) || 0;
    const pos2 = Number(lm2.position) || 0;

    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. session learning material id, desc
    const id1 = lm1.sessionLearningMaterial;
    const id2 = lm2.sessionLearningMaterial;
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  }
  <template>
    <li class="event" data-test-week-glance-event>
      <h4 id={{concat "event" @event.slug}} class="event-title">
        <span id={{concat "event" @event.slug "title"}} data-test-event-title>
          <LinkTo
            id={{concat "event" @event.slug "link"}}
            @route="events"
            @model={{@event.slug}}
            aria-labelledby="{{concat 'event' @event.slug 'title'}} {{concat
              'event'
              @event.slug
              'date'
            }} {{concat 'event' @event.slug 'link'}}"
          >
            {{@event.name}}
          </LinkTo>
        </span>
        <span id={{concat "event" @event.slug "date"}} class="date" data-test-date>
          {{#if @event.ilmSession}}
            <span class="ilm-due">
              {{t "general.dueBy"}}
            </span>
          {{/if}}
          {{formatDate @event.startDate hour="2-digit" minute="2-digit"}}
        </span>
      </h4>
      <div>
        <span class="sessiontype" data-test-session-type>
          {{@event.sessionTypeTitle}}
        </span>
        {{#if @event.location}}
          <span class="location" data-test-location>
            -
            {{@event.location}}
          </span>
        {{/if}}
        <OfferingUrlDisplay @url={{@event.url}} class="url" data-test-url />
        <span class="session-attributes" data-test-session-attributes>
          {{#if @event.attireRequired}}
            <FaIcon
              @icon="black-tie"
              @prefix="brands"
              @ariaHidden={{false}}
              @title={{t "general.whitecoatsSlashSpecialAttire"}}
            />
          {{/if}}
          {{#if @event.equipmentRequired}}
            <FaIcon @icon="flask" @ariaHidden={{false}} @title={{t "general.specialEquipment"}} />
          {{/if}}
          {{#if @event.attendanceRequired}}
            <FaIcon
              @icon="calendar-check"
              @ariaHidden={{false}}
              @title={{t "general.attendanceIsRequired"}}
            />
          {{/if}}
          {{#if @event.supplemental}}
            <FaIcon
              @icon="calendar-minus"
              @ariaHidden={{false}}
              @title={{t "general.supplementalCurriculum"}}
            />
          {{/if}}
        </span>
      </div>
      {{#if @event.instructors.length}}
        <div class="instructors" data-test-instructors>
          <label>
            {{t "general.instructors"}}:
          </label>
          {{join ", " (sortBy this.sortString @event.instructors)}}
        </div>
      {{/if}}
      {{#if @event.sessionDescription.length}}
        <p class="description" data-test-description>
          <TruncateText
            @text={{@event.sessionDescription}}
            @length={{50}}
            @slippage={{200}}
            @renderHtml={{true}}
          />
        </p>
      {{/if}}
      {{#if (or this.preworkEvents this.sessionLearningMaterials)}}
        <LearningMaterialList
          @event={{@event}}
          @preworkEvents={{this.preworkEvents}}
          @learningMaterials={{this.sessionLearningMaterials}}
        />
      {{/if}}
    </li>
  </template>
}
