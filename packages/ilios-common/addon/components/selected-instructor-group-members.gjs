<ul
  class="selected-instructor-group-members"
  data-test-selected-instructor-group-members
  ...attributes
>
  {{#each (sort-by "fullName" this.members) as |user|}}
    <li data-test-selected-instructor-group-member>
      <UserNameInfo @user={{user}} />
    </li>
  {{/each}}
</ul>