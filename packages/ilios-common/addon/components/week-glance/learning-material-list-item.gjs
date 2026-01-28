import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import UserMaterialStatus from 'ilios-common/components/user-material-status';
import not from 'ember-truth-helpers/helpers/not';
import LmIcons from 'ilios-common/components/lm-icons';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import { concat } from '@ember/helper';
import TruncateText from 'ilios-common/components/truncate-text';
import TimedReleaseSchedule from 'ilios-common/components/timed-release-schedule';
import { faClock, faDownload } from '@fortawesome/free-solid-svg-icons';
<template>
  <li class="week-glance-learning-material-list-item" ...attributes>
    {{#if @lm.isBlanked}}
      <span class="lm-type-icon" data-test-type-icon>
        <FaIcon @icon={{faClock}} @title={{t "general.timedRelease"}} />
      </span>
      <span data-test-material-title>
        {{@lm.title}}
      </span>
    {{else}}
      <UserMaterialStatus @learningMaterial={{@lm}} @disabled={{not @showLink}} />
      <LmIcons @learningMaterial={{@lm}} />
      {{#if (and @lm.absoluteFileUri @showLink)}}
        {{#if (eq @lm.mimetype "application/pdf")}}
          <a
            id={{concat "event" @event.slug "lm" @index}}
            href="{{@lm.absoluteFileUri}}?inline"
            aria-labelledby="{{concat 'event' @event.slug 'lm' @index}} {{concat
              'event'
              @event.slug
              'title'
            }}"
            data-test-material-title
          >
            {{@lm.title}}
          </a>
          <a
            id={{concat "event" @event.slug "lmdownload" @index}}
            href={{@lm.absoluteFileUri}}
            aria-label={{t "general.download"}}
            aria-labelledby="{{concat 'event' @event.slug 'lmdownload' @index}} {{concat
              'event'
              @event.slug
              'lm'
              @index
            }} {{concat 'event' @event.slug 'title'}}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaIcon @icon={{faDownload}} />
          </a>
        {{else}}
          <a
            id={{concat "event" @event.slug "lm" @index}}
            href={{@lm.absoluteFileUri}}
            aria-labelledby="{{concat 'event' @event.slug 'lm' @index}} {{concat
              'event'
              @event.slug
              'title'
            }}"
            target="_blank"
            rel="noopener noreferrer"
            data-test-material-title
          >
            {{@lm.title}}
          </a>
        {{/if}}
      {{else if (and @lm.link @showLink)}}
        <a
          id={{concat "event" @event.slug "lm" @index}}
          href={{@lm.link}}
          aria-labelledby="{{concat 'event' @event.slug 'lm' @index}} {{concat
            'event'
            @event.slug
            'title'
          }}"
          target="_blank"
          rel="noopener noreferrer"
          data-test-material-title
        >
          {{@lm.title}}
        </a>
      {{else}}
        <span data-test-material-title>
          {{@lm.title}}
        </span>
        <ul data-test-citation>
          <li>
            <small>
              {{@lm.citation}}
            </small>
          </li>
        </ul>
      {{/if}}
      {{#if @lm.publicNotes}}
        <p class="public-notes" data-test-public-notes>
          -
          <TruncateText @text={{@lm.publicNotes}} @length={{50}} />
        </p>
      {{/if}}
    {{/if}}
    <span class="timed-release-info" data-test-time-release-info>
      <TimedReleaseSchedule
        @startDate={{@lm.startDate}}
        @endDate={{@lm.endDate}}
        @showNoSchedule={{false}}
      />
    </span>
  </li>
</template>
