class @MarkdownEditor
  constructor: ->
    @checkForEditor()

  bindEditor: ->
    isiPad   = navigator.userAgent.match(/iPad/i) != null;
    isiPhone = navigator.userAgent.match(/iPhone/i) != null;
    isiPod   = navigator.userAgent.match(/iPod/i) != null;
    mobile   = isiPad or isiPhone or isiPod

    @$form      = $('form')
    @$textarea  = @$form.find('textarea.editor-content')
    @$preview   = $('.markdown-preview')

    if mobile
      $('#ace_container').remove()
      @generateMarkdownPreview @$textarea.val()
      $("[for='blog_content']").html $("[for='blog_content']").text() +
        "<br/> preview generated when keyboard is hidden"
      @$textarea.show().on 'change', =>
        @generateMarkdownPreview @$textarea.val()
    else
      @editor = ace.edit("editor")
      @editor.setTheme("ace/theme/github")
      @editor.getSession().setMode("ace/mode/markdown")
      @editor.getSession().setUseWrapMode(true)
      @editor.setValue @$textarea.val()
      @editor.clearSelection()
      @editor.setHighlightActiveLine(false)
      @editor.getSession().setUseSoftTabs(true)
      @editor.getSession().setTabSize(2)
      @editor.renderer.setShowGutter(false)
      @editor.setShowPrintMargin(false)
      @editor.setOptions
        minLines: 10
      @editor.commands.addCommand
        name: 'save'
        bindKey:
          win: 'Ctrl-S'
          mac: 'Command-S'
        exec: (editor) =>
          @$form.submit()
        readOnly: false

      window.editor = @editor

      @updateHeight()

      @bindForm()

      @generateMarkdownPreview @editor.getSession().getValue()
      @editor.getSession().on 'change', =>
        @updateHeight()
        @generateMarkdownPreview @editor.getSession().getValue()

    @setupFormHelper()
    @setupExistingImages()
    @setupNewImages()


  bindForm: ->
    @$form.on 'submit', (e) =>
      @$textarea.val @editor.getSession().getValue()
      return true

  setupFormHelper: ->
    @$form.find('.add-image').on 'click', (e) =>
      e.preventDefault()
      e.stopPropagation()
      @createUploadForm()

  createUploadForm: ->
    template = null
    template = @template()
    template = template.prependTo('#existing_images')

    template.find('.cancel').on 'click', (e) ->
      e.preventDefault()
      e.stopPropagation()
      template.remove()
    template.show()
    @bindUploader(template)

  setupNewImages: ->
    @new_image_ids = []
    @$new_images_input = $("<input type='hidden' name='new_image_ids' />").appendTo(@$form)

  setupExistingImages: ->
    images_json = $.parseJSON @$form.find('#images_json').text()
    for image in images_json
      $el = $("<div class='image'></div>").appendTo("#existing_images")
      @renderPreview(image, $el)

  template: ->
    meta = @$form.find('#meta_data')
    imageable_id = meta.attr('data-imageable-id')
    imageable_type = meta.attr('data-imageable-type')
    controller = meta.attr('data-controller')
    template = "
      <div class='image-upload-form'>
          <input class='image-upload' data-controller='#{controller}' data-imageable-id='#{imageable_id}'
            data-imageable-type='#{imageable_type}' name='image' type='file'>
          <a class='cancel' href='#'>Cancel</a>
          <div class='progress'></div>
      </div>
    "
    return $(template)

  addNewImage: (image_id) ->
    @new_image_ids.push(image_id)
    @$new_images_input.val(String(@new_image_ids))

  removeNewImage: (image_id) ->
    index = @new_image_ids.indexOf(image_id)
    @new_image_ids.splice(index, 1)
    @$new_images_input.val(String(@new_image_ids))

  bindUploader: (field) ->
    file_field = field.find('.image-upload')
    imageable_id   = file_field.data('imageable-id')
    imageable_type = file_field.data('imageable-type')
    @controller = file_field.data('controller')

    if imageable_id
      url = "/admin/#{@controller}/#{imageable_id}/images/"
    else
      url = "/admin/images/"

    file_field.fileupload
      url: url
      paramName: 'image'
      formData:
        imageable_id: imageable_id
        imageable_type: imageable_type
      success: (res) =>
        @renderPreview(res, field)
        @addNewImage(res.id)
      error: (res) ->
        console.log res
      progressall: (e,data) ->
        progress = progress = parseInt(data.loaded / data.total * 100, 10)
        field.find('.progress').css('width', progress + '%')

  previewTemplate: (image) ->
    "
    <img src='#{image.image.thumb.url}' />
    <label><input id='image_#{image.id}_featured' class='featured' type='checkbox' #{'checked' if image.featured} /> Featured?</label>
    <button class='button' data-imageurl='#{image.image.thumb.url}'>Insert Thumbnail</button>
    <button class='button' data-imageurl='#{image.image.display.url}'>Insert Full Size</button>
    <a class='remove delete button' href='#'>Delete image</a>
    "

  renderPreview: (image, $field) ->
    $field.html(@previewTemplate(image))
    $field.find('input.featured').change (e) =>
      featured = e.target.checked
      @updateFeatured(image, $field, featured)
    $field.find("[data-imageurl]").on 'click', (e) =>
      e.preventDefault()
      url = $(e.target).attr('data-imageurl')
      @insertImage(url)
    @setupDestroy(image, $field)

  insertImage: (url) ->
    markup = "![Alt Text](#{url})"
    @editor.insert(markup)

  setupDestroy: (image, $field) ->
    $field.find('.remove').off().on 'click', (e) =>
      e.preventDefault()
      e.stopPropagation()
      @destroy(image, $field)

  destroy: (image, $field) ->
    $.ajax
      type: 'DELETE'
      url: "/admin/images/#{image.id}"
      success: =>
        $field.remove()
        @removeNewImage(image.id)

  updateFeatured: (image, $field, featured) ->
    $.ajax
      type: 'PUT'
      url: "/admin/images/#{image.id}"
      data:
        image:
          featured: featured

  checkForEditor: ->
    if $('textarea.editor-content').length
      @bindEditor()

  generateMarkdownPreview: (text) ->
    @$preview.html marked(text)
    @$preview.find('pre code').each (i, e) ->
      hljs.highlightBlock(e)

  updateHeight: ->

    # http://stackoverflow.com/questions/11584061/
    newHeight = @editor.getSession().getScreenLength() * @editor.renderer.lineHeight + @editor.renderer.scrollBar.getWidth()
    $("#editor").height newHeight.toString() + "px"
    $("#ace_container").height newHeight.toString() + "px"

    # This call is required for the editor to fix all of
    # its inner structure for adapting to a change in size
    @editor.resize()

