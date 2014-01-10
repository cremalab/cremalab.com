class HomeController < ApplicationController
  def index
    render 'index'
  end
  def approach
    render 'approach/index'
  end
end
