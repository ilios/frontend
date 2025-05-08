<li
  class="single-event-learningmaterial-item"
  data-test-single-event-learningmaterial-list-item
  ...attributes
>
  {{#let (unique-id) as |templateId|}}
    {{#if @learningMaterial.isBlanked}}
      <div class="single-event-learningmaterial-item-title" data-test-title>
        {{@learningMaterial.title}}
      </div>
      <div class="single-event-learningmaterial-item-timing-info" data-test-timing-info>
        <TimedReleaseSchedule
          @startDate={{@learningMaterial.startDate}}
          @endDate={{@learningMaterial.endDate}}
          @showNoSchedule={{false}}
        />
      </div>
    {{else}}
      <div class="single-event-learningmaterial-item-title">
        <UserMaterialStatus @learningMaterial={{@learningMaterial}} @disabled={{not @linked}} />
        <LmIcons @learningMaterial={{@learningMaterial}} />
        <span data-test-title>
          {{#if @linked}}
            {{#if @learningMaterial.absoluteFileUri}}
              {{#if (eq @learningMaterial.mimetype "application/pdf")}}
                <a
                  id={{concat templateId @learningMaterial.id "lm"}}
                  href="{{@learningMaterial.absoluteFileUri}}?inline"
                  data-test-pdf-link
                >
                  {{@learningMaterial.title}}
                </a>
                <a
                  id={{concat templateId @learningMaterial.id "lmdownload"}}
                  target="_blank"
                  href={{@learningMaterial.absoluteFileUri}}
                  rel="noopener noreferrer"
                  aria-label={{t "general.download"}}
                  aria-labelledby="{{concat templateId @learningMaterial.id 'lmdownload'}} {{concat
                    templateId
                    @learningMaterial.id
                    'lm'
                  }}"
                  data-test-pdf-download-link
                >
                  <FaIcon @icon="download" />
                </a>
              {{else}}
                <a
                  target="_blank"
                  href={{@learningMaterial.absoluteFileUri}}
                  rel="noopener
                  noreferrer"
                  data-test-file-link
                >
                  {{@learningMaterial.title}}
                </a>
              {{/if}}
              <span class="single-event-learningmaterial-filesize" data-test-filesize>
                {{#if @learningMaterial.filesize}}
                  ({{filesize @learningMaterial.filesize}})
                {{/if}}
              </span>
            {{else if @learningMaterial.link}}
              <a
                target="_blank"
                href={{@learningMaterial.link}}
                rel="noopener
                noreferrer"
                data-test-link
              >
                {{@learningMaterial.title}}
              </a>
            {{else}}
              {{@learningMaterial.title}}
            {{/if}}
          {{else}}
            {{@learningMaterial.title}}
            {{#if @learningMaterial.absoluteFileUri}}
              <span class="single-event-learningmaterial-filesize" data-test-filesize>
                {{#if @learningMaterial.filesize}}
                  ({{filesize @learningMaterial.filesize}})
                {{/if}}
              </span>
            {{/if}}
          {{/if}}
        </span>
      </div>
      {{#if @learningMaterial.citation}}
        <div class="single-event-learningmaterial-item-citation" data-test-citation>
          {{@learningMaterial.citation}}
        </div>
      {{/if}}
      <div class="single-event-learningmaterial-item-timing-info" data-test-timing-info>
        <TimedReleaseSchedule
          @startDate={{@learningMaterial.startDate}}
          @endDate={{@learningMaterial.endDate}}
          @showNoSchedule={{false}}
        />
      </div>
      {{#if @learningMaterial.description}}
        <div class="single-event-learningmaterial-item-description" data-test-description>
          {{! template-lint-disable no-triple-curlies }}
          {{{@learningMaterial.description}}}
        </div>
      {{/if}}
      {{#if @learningMaterial.publicNotes}}
        <div class="single-event-learningmaterial-item-notes" data-test-public-notes>
          {{! template-lint-disable no-triple-curlies }}
          <FaIcon @icon="square-pen" />
          <p>
            {{{@learningMaterial.publicNotes}}}
          </p>
        </div>
      {{/if}}
    {{/if}}
  {{/let}}
</li>