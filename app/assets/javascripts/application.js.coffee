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
#= require modernizr
#= require jquery
#= require jquery_ujs
#= require work
#= require approach
#= require turbolinks
#= require highlight.pack

setupScrollWatcher = ->
  if $(".work-showcase").length
    $(".work-showcase").each (i, el) ->
      $el = $(el)
      window.scrollWatcher = new ScrollWatcher unless window.scrollWatcher
      window.scrollWatcher.addItem($el.parent())

bindCancel = ->
  $(".layout-main-wrapper.open").on 'click', (e) ->
    e.stopPropagation()
    e.preventDefault()
    $('.layout-main-wrapper').removeClass 'open'
    $('.menu_bar, .sideBarToggle').removeClass 'close'


bindSidebar = ->
  $('.layout-main-wrapper').bind 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', (e) ->
    $(window).trigger('nav-transition-done')


  $(window).on 'nav-transition-done', ->
    if $('.layout-main-wrapper').hasClass('open')
      bindCancel()
    else
      $(".layout-main-wrapper").off('click')

  $('.site_nav-list a ').on 'click', (e) ->
    href = @href
    e.preventDefault()
    $('.layout-main-wrapper').toggleClass 'open'
    $('button#sideBarToggle').toggleClass 'close'

    $(window).on 'nav-transition-done', ->
      $(window).off 'nav-transition-done'
      $(".layout-main-wrapper").off()
      Turbolinks.visit(href) # Visit the page via Turbolinks

bindContactForm = ->
  $form = $("#new_message")
  $form.on("ajax:success", (e, data, status, xhr) ->
    $form.find(".form-errors").remove()
    message_json = $.parseJSON(xhr.responseText)
    name = message_json.name
    $form[0].reset()
    $form.prepend "<h4>Thanks for contacting us, #{name}.</h4>"
  ).bind "ajax:error", (e, xhr, status, error) ->
    errs = $.parseJSON(xhr.responseText)
    $err_list = $form.find(".form-errors")
    if $form.find(".form-errors").length
      $err_list.empty()
    else
      $err_list = $("<ul class='form-errors'></ul>")
      $form.prepend($err_list)
    for error in errs
      markup = "<li>#{error}</li>"
      $err_list.append markup

playVideo = ->
  if $(".videoBackground").length
    $(".videoBackground video")[0].play()


document.addEventListener "touchstart", (e) ->
  console.log e
, true

$(document).on 'page:restore', ->
  playVideo()
$(document).on 'ready page:load', ->
  playVideo()
  setupScrollWatcher()

  $('pre code').each (i, e) ->
    hljs.highlightBlock(e)

  # Menu Toggle
  $('.sideBarToggle').on 'click', ->
    $('.layout-main-wrapper').toggleClass 'open'
    $('.menu_bar, .sideBarToggle').toggleClass 'close'

  bindContactForm()
  $(window).off 'nav-transition-done'
  bindSidebar() if Modernizr.csstransitions
