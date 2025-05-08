import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class DashboardUserContextFilterComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  @action
  toggle(context) {
    const newUserContext = context === this.args.userContext ? null : context;
    this.args.setUserContext(newUserContext);
  }
}

<div class="dashboard-user-context-filter" data-test-dashboard-user-context-filter>
  <input
    type="checkbox"
    id={{concat "instructing-toggle-" this.uniqueId}}
    checked={{eq @userContext "instructor"}}
    {{on "click" (fn this.toggle "instructor")}}
    data-test-instructing-input
  />
  <label
    for={{concat "instructing-toggle-" this.uniqueId}}
    class={{if (or (not @userContext) (eq @userContext "instructor")) "active"}}
    title={{if
      (eq @userContext "instructor")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyInstructorActivities")
    }}
    aria-description={{if
      (eq @userContext "instructor")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyInstructorActivities")
    }}
    data-test-instructing-label
  >
    {{t "general.instructing"}}
  </label>
  <input
    type="checkbox"
    id={{concat "learning-toggle-" this.uniqueId}}
    checked={{eq @userContext "learner"}}
    {{on "click" (fn this.toggle "learner")}}
    data-test-learning-input
  />
  <label
    for={{concat "learning-toggle-" this.uniqueId}}
    class={{if (or (not @userContext) (eq @userContext "learner")) "active"}}
    title={{if
      (eq @userContext "learner")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyLearnerActivities")
    }}
    aria-description={{if
      (eq @userContext "learner")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyLearnerActivities")
    }}
    data-test-learning-label
  >
    {{t "general.learning"}}
  </label>
  <input
    type="checkbox"
    id={{concat "admin-toggle-" this.uniqueId}}
    checked={{eq @userContext "administrator"}}
    {{on "click" (fn this.toggle "administrator")}}
    data-test-admin-input
  />
  <label
    for={{concat "admin-toggle-" this.uniqueId}}
    class={{if (or (not @userContext) (eq @userContext "administrator")) "active"}}
    title={{if
      (eq @userContext "administrator")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyAdminActivities")
    }}
    aria-description={{if
      (eq @userContext "administrator")
      (t "general.showAllMyActivities")
      (t "general.showOnlyMyAdminActivities")
    }}
    data-test-admin-label
  >
    {{t "general.admin"}}
  </label>
</div>