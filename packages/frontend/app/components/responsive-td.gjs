<template>
  <td colspan={{@largeScreenSpan}} class="hide-from-small-screen" ...attributes>{{yield}}</td>
  <td colspan={{@smallScreenSpan}} class="hide-from-large-screen" ...attributes>{{yield}}</td>
</template>
