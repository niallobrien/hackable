'use strict'

// Bootstrap & jQuery currently don't play nice with `import`
const $ = window.$ = window.jQuery = require('jquery')
const Tether = window.Tether = require('tether')
const bootstrap = require('bootstrap')

$(document).ready(() => {
  // Place JavaScript code here...
  $('.dropdown-toggle').dropdown()

  console.log('Logged from /assets/admin/scripts/admin.js')

  // Model Page Searches
  $('.model_search').keypress(e => {
    const key = e.which
    if (key === 13) {
      const query = $(this).val()
      const url = [location.protocol, '//', location.host, location.pathname].join('')
      if (query.length)
        window.location.href = url + '?search=' + encodeURI(query)
    }
  })

})