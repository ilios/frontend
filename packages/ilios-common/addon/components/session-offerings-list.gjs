import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import SessionOfferingsTimeBlockOfferings from 'ilios-common/components/session-offerings-time-block-offerings';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class SessionOfferingsListComponent extends Component {
  @service store;

  @cached
  get offeringsData() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  get offerings() {
    return this.offeringsData.isResolved ? this.offeringsData.value : [];
  }

  get offeringBlocks() {
    const dateBlocks = {};
    this.offerings.forEach((offering) => {
      const key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = new OfferingDateBlock(key);
      }
      dateBlocks[key].addOffering(offering);
    });
    //convert indexed object to array
    const dateBlockArray = [];
    let key;
    for (key in dateBlocks) {
      dateBlockArray.push(dateBlocks[key]);
    }
    return sortBy(dateBlockArray, 'dateStamp');
  }

  @action
  removeOffering(offering) {
    offering.deleteRecord();
    offering.save();
  }
  <template>
    <div class="session-offerings-list" data-test-session-offerings-list>
      {{#if this.offeringsData.isResolved}}
        {{#each this.offeringBlocks as |block|}}
          <div class="offering-block">
            <div class="offering-block-date">
              <span class="offering-block-date-dayofweek font-size-medium">
                {{formatDate block.date weekday="long"}}
              </span>
              <span class="offering-block-date-dayofmonth">
                {{formatDate block.date month="long" day="numeric"}}
              </span>
            </div>
            {{#each block.offeringTimeBlocks as |offeringTimeBlock|}}
              <div class="offering-block-time">
                {{#if offeringTimeBlock.isMultiDay}}
                  <div class="offering-block-time-time">
                    <div class="offering-block-time-time-starts">
                      <label class="offering-block-time-time-starts-label">
                        {{t "general.starts"}}:
                      </label>
                      {{formatDate
                        offeringTimeBlock.startDate
                        weekday="long"
                        month="long"
                        day="numeric"
                        hour="2-digit"
                        minute="2-digit"
                      }}
                    </div>
                    <div class="offering-block-time-time-ends">
                      <label class="offering-block-time-time-ends-label">
                        {{t "general.ends"}}:
                      </label>
                      {{formatDate
                        offeringTimeBlock.endDate
                        weekday="long"
                        month="long"
                        day="numeric"
                        hour="2-digit"
                        minute="2-digit"
                      }}
                    </div>
                  </div>
                {{else}}
                  <div class="offering-block-time-time">
                    <span class="offering-block-time-time-starttime">
                      <label class="offering-block-time-time-starttime-label">
                        {{t "general.starts"}}:
                      </label>
                      {{formatDate offeringTimeBlock.startDate hour="2-digit" minute="2-digit"}}
                    </span>
                    <span class="offering-block-time-time-endtime">
                      <label class="offering-block-time-time-endtime-label">
                        {{t "general.ends"}}:
                      </label>
                      {{formatDate offeringTimeBlock.endDate hour="2-digit" minute="2-digit"}}
                    </span>
                  </div>
                {{/if}}
                <SessionOfferingsTimeBlockOfferings
                  @offeringTimeBlock={{offeringTimeBlock}}
                  @removeOffering={{this.removeOffering}}
                  @editable={{@editable}}
                  @toggleIsEditing={{@toggleIsEditing}}
                />
              </div>
            {{/each}}
          </div>
        {{/each}}
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
