import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';

export default class ThemeImageNonStudentComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }
  get colorScheme() {
    return htmlSafe(`color-scheme: ${this.args.colorScheme}`);
  }
  <template>
    <svg
      id={{this.uniqueId}}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      style={{this.colorScheme}}
      class="mobile {{{@colorScheme}}}"
      data-test-non-student
      ...attributes
    >
      <title>Theme Preview</title>

      <!-- page -->
      <rect width="512" height="512" fill="light-dark(var(--white), var(--black))" />

      <!-- header -->
      <rect
        x="0"
        y="0"
        width="512"
        height="42"
        fill="light-dark(var(--orange), var(--dark-orange))"
      />

      <!-- ilios logo -->
      <g transform="translate(18 21)">
        <circle r="10" fill="light-dark(var(--bright-white), var(--lightest-grey))" />
        <path
          d="M0-17 L3-7 L11-13 L7-3 L17 0 L7 3 L13 11 L3 7 L0 17 L-3 7 L-11 13 L-7 3 L-17 0 L-7-3 L-13-11 L-3-7 Z"
          fill="light-dark(var(--bright-white), var(--lightest-grey))"
        />
      </g>

      <!-- profile menu -->
      <rect
        x="425"
        y="9"
        width="76"
        height="24"
        rx="2"
        fill="light-dark(var(--bright-white), var(--dark-grey))"
      />
      <circle cx="437" cy="21" r="5" fill="light-dark(var(--black), var(--light-grey))" />
      <path d="M433 29h8a4 4 0 0 0-8 0Z" fill="light-dark(var(--black), var(--light-grey))" />

      <!-- main nav -->
      <rect x="0" y="42" width="512" height="40" fill="light-dark(var(--grey), var(--dark-grey))" />

      <!-- dashboard nav -->
      <rect
        x="10"
        y="95"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--green), var(--green))"
      />
      <rect
        x="120"
        y="95"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />
      <rect
        x="225"
        y="95"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />

      <!-- title -->
      <rect
        x="10"
        y="140"
        width="324"
        height="10"
        rx="3"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="390"
        y="140"
        width="112"
        height="11"
        rx="3"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />

      <!-- waag box -->
      <rect
        x="10"
        y="165"
        width="490"
        height="330"
        rx="5"
        fill="light-dark(var(--bright-white), var(--black))"
        stroke="light-dark(var(--lightest-grey), var(--dark-grey))"
        stroke-width="1"
      />

      <!-- event 1 -->
      <rect
        x="20"
        y="180"
        width="2"
        height="55"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="184"
        width="112"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="150"
        y="184"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="194"
        width="155"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="40"
        y="204"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="214"
        width="96"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="225"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="226"
        width="103"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <!-- event 2 -->
      <rect
        x="20"
        y="248"
        width="2"
        height="78"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="248"
        width="184"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="220"
        y="248"
        width="48"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="258"
        width="102"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="40"
        y="268"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="279"
        width="83"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="290"
        width="300"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="30"
        y="301"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="302"
        width="184"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="314"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="315"
        width="222"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <!-- event 3 -->
      <rect
        x="20"
        y="334"
        width="2"
        height="55"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="334"
        width="112"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="150"
        y="334"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="344"
        width="155"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="40"
        y="354"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <rect
        x="40"
        y="354"
        width="54"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />
      <rect
        x="30"
        y="365"
        width="210"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />

      <!-- event 4 -->
      <rect
        x="20"
        y="376"
        width="2"
        height="99"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="393"
        width="190"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="230"
        y="393"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="403"
        width="133"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="40"
        y="413"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="424"
        width="98"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="435"
        width="150"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="40"
        y="445"
        width="118"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />
      <rect
        x="40"
        y="454"
        width="54"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />

      <!-- footer -->
      <rect
        x="0"
        y="478"
        width="512"
        height="34"
        fill="light-dark(var(--orange), var(--dark-orange))"
      />
      <rect
        x="444"
        y="487"
        width="58"
        height="16"
        rx="2"
        fill="light-dark(var(--dark-orange), var(--orange))"
        opacity="0.45"
      />
    </svg>
  </template>
}
