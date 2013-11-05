$(document).on 'ready page:load', ->
  marked.setOptions
    gfm: true
    tables: true
    breaks: false
    pedantic: false
    sanitize: true
    smartLists: true
    smartypants: true
    langPrefix: 'lang-'


  editor = new MarkdownEditor() unless editor

class MarkdownEditor
  constructor: ->
    @checkForEditor()

  bindEditor: ->
    @$form      = $('form')
    @$textarea  = @$form.find('textarea.markdown')
    @$preview   = $('.markdown-preview')
    @generateMarkdownPreview @$textarea.val()
    @setupFormHelper()
    @setupExistingImages()
    @setupNewImages()

    @$textarea.on 'keyup', (e) =>
      @generateMarkdownPreview $(e.target).val()

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


  renderPreview: (image, $field) ->
    $field.append("<img src='#{image.image.thumb.url}' /><a class='remove' href='#'>Delete image</a>").append("
      <p>Full size: <pre>![Alt text](#{image.image.url})</pre></p>
      <p>Thumb: <pre>![Alt text](#{image.image.thumb.url})</pre></p>
    ")
    $field.find('.image-upload').fileupload('destroy').remove().end().find('.cancel, .progress').remove()
    @setupDestroy(image, $field)

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

  checkForEditor: ->
    if $('textarea.markdown').length
      @bindEditor()

  generateMarkdownPreview: (text) ->
    @$preview.html marked(text)

