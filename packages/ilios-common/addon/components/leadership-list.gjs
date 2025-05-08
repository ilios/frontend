<div class="leadership-list" data-test-leadership-list>
  <table>
    <thead>
      <tr>
        {{#if @showDirectors}}
          <th>
            {{t "general.directors"}}
          </th>
        {{/if}}
        {{#if @showAdministrators}}
          <th>
            {{t "general.administrators"}}
          </th>
        {{/if}}
        {{#if @showStudentAdvisors}}
          <th>
            {{t "general.studentAdvisors"}}
          </th>
        {{/if}}
      </tr>
    </thead>
    <tbody>
      <tr>
        {{#if @showDirectors}}
          <td class="text-top" data-test-directors>
            <ul>
              {{#if (is-array @directors)}}
                {{#each (sort-by "fullName" @directors) as |user|}}
                  <li>
                    {{#unless user.enabled}}
                      <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                    {{/unless}}
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              {{else}}
                <LoadingSpinner />
              {{/if}}
            </ul>
          </td>
        {{/if}}
        {{#if @showAdministrators}}
          <td class="text-top" data-test-administrators>
            <ul>
              {{#if (is-array @administrators)}}
                {{#each (sort-by "fullName" @administrators) as |user|}}
                  <li>
                    {{#unless user.enabled}}
                      <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                    {{/unless}}
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              {{else}}
                <LoadingSpinner />
              {{/if}}
            </ul>
          </td>
        {{/if}}
        {{#if @showStudentAdvisors}}
          <td class="text-top" data-test-student-advisors>
            <ul>
              {{#if (is-array @studentAdvisors)}}
                {{#each (sort-by "fullName" @studentAdvisors) as |user|}}
                  <li>
                    {{#unless user.enabled}}
                      <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                    {{/unless}}
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              {{else}}
                <LoadingSpinner />
              {{/if}}
            </ul>
          </td>
        {{/if}}
      </tr>
    </tbody>
  </table>
</div>