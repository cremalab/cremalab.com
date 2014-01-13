class HomeController < ApplicationController
  def index
    render 'index'
  end
  def approach
    @pageClass = 'sub-approach'
    render 'approach/index'
  end
end
