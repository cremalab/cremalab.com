#= require jquery_nested_form
#= require marked
#= require markdown_editor
#= require jquery.sortable.min
#= require jquery.ui.widget.js
#= require jquery.iframe-transport.js
#= require jquery.fileupload

$(document).on 'ready page:load', ->
  marked.setOptions
    gfm: true
    tables: true
    breaks: false
    pedantic: false
    sanitize: true
    smartLists: true
    smartypants: true
    langPrefix: ''
    highlight: (code, lang) ->
      hljs.highlightAuto(code, lang).value

  editor = new MarkdownEditor() unless editor

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