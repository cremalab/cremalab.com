# This is a manifest file that'll be compiled into application.js, which will include all the files
# listed below.
#
# Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
# or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
#
# It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
# compiled file.
#
# Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
# about supported directives.
#
#= require jquery
#= require jquery_ujs
#= require turbolinks
#= require_tree .
#= require marked
#= require jquery.sortable.min

$(document).on 'ready page:load', ->

  $('button#sideBarToggle').on 'click', ->
    $('.layout-main-wrapper').toggleClass 'open'
    $('button#sideBarToggle').toggleClass 'close'

  $('.works.sortable').sortable(
    items: '.work'
    handle: '.drag-handle'
  ).bind 'sortupdate', (a,b,c) ->
    $('.works.sortable .work').each (index,el) ->
      current_index = Number $(el).attr('data-index')
      work_id   = $(el).attr('data-id')
      unless index is current_index
        $.ajax
          type: 'PUT'
          url: "/admin/work/#{work_id}"
          dataType: 'json'
          data:
            work:
              order_index: index
          success: (res) ->
            $(el).attr('data-index', res.order_index)