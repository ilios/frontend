<div class="session-offerings-list" data-test-session-offerings-list>
  {{#if this.offeringsData.isResolved}}
    {{#each this.offeringBlocks as |block|}}
      <div class="offering-block">
        <div class="offering-block-date">
          <span class="offering-block-date-dayofweek">
            {{format-date block.date weekday="long"}}
          </span>
          <span class="offering-block-date-dayofmonth">
            {{format-date block.date month="long" day="numeric"}}
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
                  {{format-date
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
                  {{format-date
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
                  {{format-date offeringTimeBlock.startDate hour="2-digit" minute="2-digit"}}
                </span>
                <span class="offering-block-time-time-endtime">
                  <label class="offering-block-time-time-endtime-label">
                    {{t "general.ends"}}:
                  </label>
                  {{format-date offeringTimeBlock.endDate hour="2-digit" minute="2-digit"}}
                </span>
              </div>
            {{/if}}
            <SessionOfferingsTimeBlockOfferings
              @offeringTimeBlock={{offeringTimeBlock}}
              @removeOffering={{this.removeOffering}}
              @editable={{@editable}}
            />
          </div>
        {{/each}}
      </div>
    {{/each}}
  {{else}}
    <LoadingSpinner />
  {{/if}}
</div>