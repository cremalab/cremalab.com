@ScrollWatcher = class ScrollWatcher
  constructor: ->
    @items = []
    @positions = []
    @watch()
  calcBottom: ($item) ->
    scrollTop = $item.position().top
    scrollBottom = scrollTop + $item.height()
  recalculate: ->
    for item in @items
      bottom = @calcBottom item
      @positions[_i] = bottom
  watch: (item) ->
    $(window).on "resize", (e) =>
      @recalculate()
    $(window).on "scroll load", (e) =>
      pageBottom = window.scrollY + window.innerHeight
      for position in @positions
        if pageBottom >= position
          @items[_i].addClass "active"
        else
          @items[_i].removeClass "active"
  addItem: ($item) ->
    bottom = @calcBottom $item
    @items.push($item)
    @positions.push(bottom)

