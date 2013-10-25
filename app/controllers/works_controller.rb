class WorksController < ApplicationController

  before_filter :require_login, except: [:index, :show]

  def index
    @works = Work.all
  end

  def show
    @work = Work.find(params[:id])
  end

end
