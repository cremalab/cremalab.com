class WorksController < ApplicationController

  def index
    @works = Work.all.order("order_index ASC")
  end

  def show
    @work = Work.find(params[:id])
  end

end
