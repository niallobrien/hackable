'use strict'

// Bootstrap & jQuery currently don't play nice with `import`
const $ = window.$ = window.jQuery = require('jquery')
const Tether = window.Tether = require('tether')
const bootstrap = require('bootstrap')

import { Greetings } from './modules/greetings'

$(document).ready(function() {
  // Place JavaScript code here...
  $('.dropdown-toggle').dropdown()

  Greetings.to('awesome developer')
})