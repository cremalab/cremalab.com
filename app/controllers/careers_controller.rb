class CareersController < ApplicationController
  def index
    @careers = Career.all

  end

  def show
    @careers = Career.find(params[:id])
  end


end
