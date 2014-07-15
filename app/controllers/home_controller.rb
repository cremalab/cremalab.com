class HomeController < ApplicationController
  def index
    @careers = Career.all
    render 'index'
  end
  def approach
    @pageClass = 'sub-approach'
    render 'approach/index'
  end
end
