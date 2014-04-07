class CareersController < ApplicationController
  def index
    @careers = Career.all

  end

  def show
    @career = Career.find(params[:id])
  end


end
