class WorksController < ApplicationController

  before_filter :require_login, except: [:index, :show]

  def index
    @works = Work.all.order("order_index ASC")
  end

  def show
    @work = Work.find(params[:id])
  end

end
