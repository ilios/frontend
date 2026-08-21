import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';

export default class ThemeImageStudentComponent extends Component {
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
      class="{{{@colorScheme}}}"
      data-test-student
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

      <!-- dashboard nav -->
      <rect
        x="10"
        y="55"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--green), var(--green))"
      />
      <rect
        x="120"
        y="55"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />
      <rect
        x="225"
        y="55"
        width="100"
        height="28"
        rx="2"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />

      <!-- title -->
      <rect
        x="10"
        y="100"
        width="324"
        height="10"
        rx="3"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="390"
        y="100"
        width="112"
        height="11"
        rx="3"
        fill="light-dark(var(--blue), var(--bright-blue))"
      />

      <!-- waag box -->
      <rect
        x="10"
        y="125"
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
        y="140"
        width="2"
        height="55"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="144"
        width="112"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="150"
        y="144"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="154"
        width="155"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="40"
        y="164"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="174"
        width="96"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="185"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="186"
        width="103"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <!-- event 2 -->
      <rect
        x="20"
        y="208"
        width="2"
        height="78"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="208"
        width="184"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="220"
        y="208"
        width="48"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="218"
        width="102"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--light-grey))"
      />
      <rect
        x="40"
        y="228"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="239"
        width="83"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="250"
        width="300"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="30"
        y="261"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="262"
        width="184"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="274"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="275"
        width="222"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <!-- event 3 -->
      <rect
        x="20"
        y="294"
        width="2"
        height="55"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="294"
        width="112"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="150"
        y="294"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="304"
        width="155"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="40"
        y="314"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />

      <rect
        x="40"
        y="314"
        width="54"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />
      <rect
        x="30"
        y="325"
        width="210"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />

      <!-- event 4 -->
      <rect
        x="20"
        y="336"
        width="2"
        height="99"
        fill="light-dark(var(--lightest-blue), var(--blue))"
      />
      <rect
        x="30"
        y="353"
        width="190"
        height="6"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="230"
        y="353"
        width="49"
        height="6"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="363"
        width="133"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="40"
        y="373"
        width="77"
        height="4"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="30"
        y="384"
        width="98"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="30"
        y="395"
        width="150"
        height="4"
        rx="2"
        fill="light-dark(var(--black), var(--light-grey))"
      />
      <rect
        x="40"
        y="405"
        width="118"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />
      <rect
        x="40"
        y="414"
        width="54"
        height="4"
        rx="2"
        fill="light-dark(var(--light-grey), var(--grey))"
      />
      <rect
        x="30"
        y="425"
        width="385"
        height="4"
        rx="2"
        fill="light-dark(var(--grey), var(--dark-grey))"
      />
      <rect
        x="30"
        y="437"
        width="8"
        height="8"
        rx="1"
        fill="none"
        stroke="light-dark(var(--lightest-grey), var(--grey))"
        stroke-width="1"
      />
      <rect
        x="40"
        y="438"
        width="173"
        height="5"
        rx="2"
        fill="light-dark(var(--blue), var(--grey))"
      />
      <rect
        x="230"
        y="438"
        width="8"
        height="5"
        rx="1"
        fill="light-dark(var(--light-blue), var(--blue))"
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
