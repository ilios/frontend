import {
  attribute,
  clickable,
  clickOnText,
  count,
  create,
  collection,
  fillable,
  hasClass,
  isVisible,
  notHasClass,
  text,
  value,
  visitable
} from 'ember-cli-page-object';
import { fillInFroalaEditor, froalaEditorValue } from 'ilios/tests/helpers/froala-editor';
import { datePicker } from 'ilios/tests/helpers/date-picker';
import meshManager from 'ilios/tests/pages/components/mesh-manager';

export default create({
  scope: '[data-test-ilios-course-details]',
  visit: visitable('/courses/:courseId'),
  collapseControl: clickable('.detail-collapsed-control'),
  titles: count('.title'),

  header: {
    scope: '[data-test-course-header]',
    title: text('.editable'),
    edit: clickable('.clickable'),
    set: fillable('input'),
    save: clickable('.done')
  },

  overview: {
    scope: '[data-test-course-overview]',
    rollover: {
      scope: 'a.rollover',
      visit: clickable(),
      link: attribute('href'),
      visible: isVisible(),
    },
    externalId: {
      scope: '.courseexternalid',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    startDate: {
      scope: '.coursestartdate',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    endDate: {
      scope: '.courseenddate',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    level: {
      scope: '.courselevel',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    universalLocator: text('.universallocator'),
    clerkshipType: {
      scope: '.clerkshiptype',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('select'),
      save: clickable('.done')
    },
    courseDirectors: {
      scope: '.coursedirectors',
      selected: collection({
        scope: '.directors',
        itemScope: 'li',
        item: {
          name: text(),
        },
      }),
      manager: {
        scope: '[data-test-course-director-manager]',
        selected: collection({
          scope: '.selected-directors',
          itemScope: 'li',
          item: {
            name: text(),
            remove: clickable(),
          },
        }),
        search: fillable('[data-test-search-box] input'),
        searchResults: collection({
          scope: '.results',
          itemScope: '[data-test-result]',
          item: {
            name: text(),
            add: clickable(),
            isActive: notHasClass('inactive'),
            inactive: hasClass('inactive'),
          },
        }),
        save: clickable('.bigadd'),
      },
      manage: clickable('.clickable'),
    },

  },

  objectives: {
    scope: '[data-test-detail-objectives]',
    current: collection({
      scope: 'table',
      itemScope: 'tbody tr',
      item: {
        title: text('td', { at: 0 }),
        parents: collection({
          scope: 'td',
          itemScope: '[data-test-parent]',
          item: {
            title: text(),
          },
        }, { at: 1 }),
      },
    }),
  },

  learningMaterials: {
    scope: '[data-test-detail-learning-materials]',
    createNew: clickable('.detail-learningmaterials-actions button'),
    pickNew: clickOnText('.detail-learningmaterials-actions ul li'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    canSearch: isVisible('[data-test-search-box]'),
    canCreateNew: isVisible('.detail-learningmaterials-actions .action-menu'),
    canCollapse: isVisible('.detail-learningmaterials-actions .collapse-button'),
    search: fillable('[data-test-search-box] input'),
    current: collection({
      scope: '.detail-learningmaterials-content table',
      itemScope: 'tbody tr',
      item: {
        title: text('td', { at: 0 }),
        owner: text('td', { at: 1 }),
        required: text('td', { at: 2 }),
        notes: text('td', { at: 3 }),
        mesh: text('td', { at: 4 }),
        status: text('td', { at: 5 }),
        isNotePublic: isVisible('i.fa-eye'),
        isTimedRelease: isVisible('.fa-clock-o'),
        details: clickable('.link', { at: 0 }),
      },
    }),
    searchResults: collection({
      scope: '.lm-search-results',
      itemScope: '> li',
      item: {
        title: text('h4'),
        description: text('learning-material-description'),
        hasFileIcon: isVisible('.fa-file'),
        properties: collection({
          scope: '.learning-material-properties',
          itemScope: 'li',
          item: {
            value: text(),
          },
        }),
        add: clickable(),
      },
    }),
    newLearningMaterial: {
      scope: '.new-learningmaterial',
      name: fillable('input', { at: 0}),
      author: fillable('input', { at: 1}),
      url: fillable('input', { at: 2}),
      citation: fillable('textarea'),
      userName: text('.owninguser'),
      status: fillable('select', { at: 0}),
      role: fillable('select', { at: 1 }),
      description: fillInFroalaEditor('.fr-box'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
    },
    manager: {
      scope: '.learningmaterial-manager',
      name: text('.displayname'),
      author: text('.originalauthor'),
      description: text('.description'),
      copyrightPermission: text('.copyrightpermission'),
      copyrightRationale: text('.copyrightrationale'),
      uploadDate: text('.upload-date'),
      downloadText: text('.downloadurl'),
      downloadUrl: attribute('href', '.downloadurl a'),
      link: text('.link'),
      citation: text('.citation'),
      hasCopyrightPermission: isVisible('.copyrightpermission'),
      hasCopyrightRationale: isVisible('.copyrightrationale'),
      hasLink: isVisible('.link'),
      hasCitation: isVisible('.citation'),
      hasFile: isVisible('.downloadurl'),
      required: clickable('.required .switch-handle'),
      publicNotes: clickable('.publicnotes .switch-handle'),
      status: fillable('select', { at: 0}),
      statusValue: value('select', { at: 0}),
      notes: fillInFroalaEditor('.fr-box'),
      notesValue: froalaEditorValue('.fr-box'),
      addStartDate: clickable('[data-test-add-start-date]'),
      addEndDate: clickable('[data-test-add-end-date]'),
      timedReleaseSummary: text('.timed-release-schedule'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      meshManager,
      startDate: datePicker('.start-date input'),
      startTime: {
        scope: '.start-time',
        hour: fillable('select', {at: 0}),
        minute: fillable('select', {at: 1}),
        ampm: fillable('select', {at: 2}),
      },
      endDate: datePicker('.end-date input'),
      endTime: {
        scope: '.end-time',
        hour: fillable('select', {at: 0}),
        minute: fillable('select', {at: 1}),
        ampm: fillable('select', {at: 2}),
      },
      hasEndDateValidationError: isVisible('[data-test-end-date-validation-error-message]')
    }
  },

  meshTerms: {
    scope: '[data-test-detail-mesh]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection({
      scope: '.selected-mesh-terms',
      itemScope: 'li',
      item: {
        title: text('.term-title'),
      },
    }),
    meshManager,
  },

  taxonomies: {
    scope: '[data-test-detail-taxonomies]',
    title: text('.title'),
    manage: clickable('.actions button'),
    save: clickable('.actions .bigadd'),
    cancel: clickable('.actions .bigcancel'),
    vocabularies: collection({
      scope: '.content',
      itemScope: '.detail-terms-list',
      item: {
        name: text('strong', { at: 0 }),
        terms: collection({
          scope: '.selected-taxonomy-terms',
          itemScope: 'li',
          item: {
            name: text(),
          },
        }),
      },
    }),
    manager: {
      selectedTerms: collection({
        scope: '.removable-list',
        itemScope: 'li',
        item: {
          name: text(),
          remove: clickable(),
        },
      }),
      availableTerms: collection({
        scope: '.selectable-terms-list',
        itemScope: 'li',
        item: {
          name: text(),
          notSelected: notHasClass('selected', 'div'),
          isSelected: hasClass('selected', 'div'),
          add: clickable('div'),
        },
      }),
    }
  },

  collapsedTaxonomies: {
    scope: '[data-test-collapsed-taxonomies]',
    title: text('.title'),
    headers: collection({
      scope: 'thead',
      itemScope: 'th',
      item: {
        title: text(),
      },
    }),
    vocabularies: collection({
      scope: 'tbody',
      itemScope: 'tr',
      item: {
        name: text('td', { at: 0}),
        school: text('td', { at: 1}),
        terms: text('td', { at: 2}),
      },
    }),
  },

  cohorts: {
    scope: '[data-test-detail-cohorts]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection({
      scope: 'table',
      itemScope: 'tbody tr',
      item: {
        school: text('td', { at: 0 }),
        program: text('td', { at: 1 }),
        cohort: text('td', { at: 2 }),
        level: text('td', { at: 3 }),
      },
    }),
    selected: collection({
      scope: '.selected-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        remove: clickable(),
      },
    }),
    selectable: collection({
      scope: '.selectable-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        add: clickable(),
      },
    }),
  },

});
