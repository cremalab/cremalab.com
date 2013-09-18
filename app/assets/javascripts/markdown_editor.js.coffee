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


  editor = new MarkdownEditor()

class MarkdownEditor
  constructor: ->
    @checkForEditor()
    $(document).on 'page:change', =>
      @checkForEditor()

  bindEditor: ->
    @$textarea = $('textarea.markdown')
    @$preview  = $('.markdown-preview')
    @generateMarkdownPreview @$textarea.val()

    @$textarea.on 'keyup', (e) =>
      @generateMarkdownPreview $(e.target).val()

  checkForEditor: ->
    if $('textarea.markdown').length
      @bindEditor()

  generateMarkdownPreview: (text) ->
    @$preview.html marked(text)