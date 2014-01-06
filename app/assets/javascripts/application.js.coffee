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
#= require turbolinks
#= require highlight.pack
#= require hogan

loadCss = (url) ->
  link = document.createElement("link")
  link.type = "text/css"
  link.rel = "stylesheet"
  link.href = url
  document.getElementsByTagName("head")[0].appendChild(link)

@loadWorkTemplate = (slug, id) ->
  loadCss("/assets/works/#{slug}.css");
  require ["/assets/templates/#{slug}"], ->
    template = HoganTemplates["#{slug}"].render()
    $el = $(".work-showcase[data-id='#{id}']")
    $el.html(template)
    window.scrollWatcher = new ScrollWatcher unless window.scrollWatcher
    window.scrollWatcher.addItem($el.parent())


bindSidebar = ->

  $('.layout-main-wrapper').bind 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', (e) ->
    $(window).trigger('nav-transition-done')

  $('.site_nav-list a ').on 'click', (e) ->
    href = @href
    e.preventDefault()
    $('.layout-main-wrapper').toggleClass 'open'
    $('button#sideBarToggle').toggleClass 'close'

    $(window).on 'nav-transition-done', ->
      $(window).off 'nav-transition-done'
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
    console.log $err_list
    $err_list = $form.find(".form-errors")
    if $form.find(".form-errors").length
      $err_list.empty()
    else
      $err_list = $("<ul class='form-errors'></ul>")
      $form.prepend($err_list)
    for error in errs
      markup = "<li>#{error}</li>"
      $err_list.append markup

$(document).on 'ready page:load', ->
  $('pre code').each (i, e) ->
    hljs.highlightBlock(e)

  # Menu Toggle
  $('.sideBarToggle').on 'click', ->
    $('.layout-main-wrapper').toggleClass 'open'
    $('.menu_bar, .sideBarToggle').toggleClass 'close'

  bindContactForm()
  bindSidebar() if Modernizr.csstransitions
