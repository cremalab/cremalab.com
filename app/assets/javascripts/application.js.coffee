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
#= require jquery.ui.widget.js
#= require jquery.iframe-transport.js
#= require jquery.fileupload

$(document).on 'ready page:load', ->

  $('button#sideBarToggle').on 'click', ->
    $('.layout-main-wrapper').toggleClass 'open'
    $('button#sideBarToggle').toggleClass 'close'

  $('.sortable').sortable(
    items: '.item'
    handle: '.drag-handle'
  ).bind 'sortupdate', (e) ->
    $list = $(e.target)
    controller = $list.attr('data-controller')
    model      = $list.attr('data-model')
    $('.sortable .item').each (index,el) ->
      current_index = Number $(el).attr('data-index')
      item_id   = $(el).attr('data-id')
      unless index is current_index
        data = {}
        data["#{model}"] = {}
        data["#{model}"]['order_index'] = index
        $.ajax
          type: 'PUT'
          url: "/admin/#{controller}/#{item_id}"
          dataType: 'json'
          data: data
          success: (res) ->
            $(el).attr('data-index', res.order_index)
