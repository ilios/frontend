import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <section
    class="school-session-attributes-collapsed"
    data-test-school-session-attributes-collapsed
    ...attributes
  >
    <div>
      <button
        class="title link-button"
        type="button"
        aria-expanded="false"
        data-test-title
        {{on "click" @expand}}
      >
        {{t "general.sessionAttributes"}}
        <FaIcon @icon="caret-right" />
      </button>
    </div>
    <div class="content">
      <table class="ilios-table condensed">
        <thead>
          <tr>
            <th class="text-left">
              {{t "general.attribute"}}
            </th>
            <th class="text-left">
              {{t "general.enabled"}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr data-test-attendance-required>
            <td>
              {{t "general.attendanceRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if @showSessionAttendanceRequired "check" "ban"}}
                class={{if @showSessionAttendanceRequired "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-supplemental>
            <td>
              {{t "general.supplementalCurriculum"}}
            </td>
            <td>
              <FaIcon
                @icon={{if @showSessionSupplemental "check" "ban"}}
                class={{if @showSessionSupplemental "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-special-attire-required>
            <td>
              {{t "general.specialAttireRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if @showSessionSpecialAttireRequired "check" "ban"}}
                class={{if @showSessionSpecialAttireRequired "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-special-equipment-required>
            <td>
              {{t "general.specialEquipmentRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if @showSessionSpecialEquipmentRequired "check" "ban"}}
                class={{if @showSessionSpecialEquipmentRequired "yes" "no"}}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
