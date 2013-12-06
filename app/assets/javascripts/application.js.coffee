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
#= require turbolinks
#= require highlight.pack

bindSidebar = ->
  $('.layout-main-wrapper').bind 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', (e) ->
    $(window).trigger('nav-transition-done')

  $('.siteNav a ').on 'click', (e) ->
    href = @href
    e.preventDefault()
    $('.layout-main-wrapper').toggleClass('open')
    $('button#sideBarToggle').toggleClass 'close'

    $(window).on 'nav-transition-done', ->
      $(window).off 'nav-transition-done'
      Turbolinks.visit(href) # Visit the page via Turbolinks

$(document).on 'ready page:load', ->
  $('pre code').each (i, e) ->
    hljs.highlightBlock(e)

  $('button#sideBarToggle').on 'click', ->
    $('.layout-main-wrapper').toggleClass 'open'
    $('button#sideBarToggle').toggleClass 'close'


  bindSidebar() if Modernizr.csstransitions
