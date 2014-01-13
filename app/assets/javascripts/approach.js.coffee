transition_events = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd'
delay_seconds     = 3

class TextRotator
  constructor: ($el, options) ->
    @$el         = $el
    @$tray       = @$el.find(".text_rotator-tray")
    @render()

  render: ->
    @phrases = []
    @$el.find(".text_rotator-text").each (i, el) =>
      @phrases.push $(el).text()
      $(el).remove()
    @prepFor 0


  display: (i) ->
    @$text_container.text(@phrases[i]).removeClass('fadeOut').addClass('active')
    if i is @phrases.length
      @next = 0
    else
      @next = i + 1

    delay = setTimeout =>
      clearTimeout(delay)
      @cleanup()
    , delay_seconds * 1000

  prepFor: (i) ->
    unless @$text_container
      @$text_container = $("<div class='text_rotator-text'></div>").appendTo @$tray

    @$text_container.unbind(transition_events).bind transition_events, =>
      @renderText()
    @display i

  cleanup: ->
    @$text_container.bind transition_events, =>
      @renderText()
    .removeClass('active').addClass('fadeOut')


  renderText: (e) ->
    @$text_container.unbind(transition_events)
    @display @next

class BoringTextRotator extends TextRotator
  cleanup: ->
    @$text_container.removeClass('active').addClass('fadeOut')
    @renderText()


$(document).on 'ready page:load page:restore', ->
  $('.text_rotator').each (i, el) ->
    if Modernizr.csstransitions
      new TextRotator $(el)
    else
      new BoringTextRotator $(el)