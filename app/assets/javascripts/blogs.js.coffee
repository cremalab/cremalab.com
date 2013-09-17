# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->

  marked.setOptions
    gfm: true
    tables: true
    breaks: false
    pedantic: false
    sanitize: true
    smartLists: true
    smartypants: true
    langPrefix: 'lang-'


  editor = new BlogEditor()

class BlogEditor
  constructor: ->
    @checkForEditor()
    $(document).on 'page:change', =>
      @checkForEditor()

  bindEditor: ->
    @$textarea = $('.blog-form .blog-content')
    @$preview  = $('.blog-preview')
    @generateMarkdownPreview @$textarea.val()

    @$textarea.on 'keyup', (e) =>
      @generateMarkdownPreview $(e.target).val()

  checkForEditor: ->
    if $('.blog-form').length
      @bindEditor()

  generateMarkdownPreview: (text) ->
    @$preview.html marked(text)