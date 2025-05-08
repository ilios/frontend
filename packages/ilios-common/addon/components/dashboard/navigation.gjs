<nav
  class="dashboard-navigation"
  data-test-dashboard-navigation
  aria-label={{t "general.dashboardNavigation"}}
  ...attributes
>
  <ul>
    <li>
      <LinkTo
        @route="dashboard.week"
        title={{t "general.weekAtAGlance"}}
        @current-when="dashboard.week"
        data-test-link-week
      >
        {{t "general.weekAtAGlance"}}
      </LinkTo>
    </li>
    <li>
      <LinkTo
        @route="dashboard.materials"
        title={{t "general.materials"}}
        @current-when="dashboard.materials"
        data-test-link-materials
      >
        {{t "general.materials"}}
      </LinkTo>
    </li>
    <li>
      <LinkTo
        @route="dashboard.calendar"
        title={{t "general.calendar"}}
        @current-when="dashboard.calendar"
        data-test-link-calendar
      >
        {{t "general.calendar"}}
      </LinkTo>
      <IcsFeed @url={{this.icsFeedUrl}} @instructions={{this.icsInstructions}} />
    </li>
  </ul>
</nav>