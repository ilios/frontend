import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretRight, faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
<template>
  <section
    class="school-learning-material-attributes-collapsed"
    data-test-school-learning-material-attributes-collapsed
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
        {{t "general.learningMaterialAttributes"}}
        <FaIcon @icon={{faCaretRight}} />
      </button>
    </div>
    <div class="content">
      <table class="ilios-table ilios-table-colors condensed">
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
          <tr data-test-accessibility-required>
            <td>
              {{t "general.accessibilityRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if @accessibilityRequired faCheck faBan}}
                class={{if @accessibilityRequired "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-accessibility-requirements-link>
            <td>
              {{t "general.accessibilityRequirementsLink"}}
            </td>
            <td>
              <span>
                {{@accessibilityRequirementsLink}}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
