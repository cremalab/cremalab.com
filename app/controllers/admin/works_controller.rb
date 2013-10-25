class Admin::WorksController < ApplicationController

  before_filter :require_login
  respond_to :html, :json

  def index
    @works = Work.all
  end

  def new
    @work = Work.new
  end

  def edit
    @work = Work.find(params[:id])
  end

  def create
    @work = Work.new(work_params)
    if @work.save
      respond_with @work
    else
      render :new
    end
  end

  def update
    @work = Work.find(params[:id])
    if @work.update_attributes(work_params)
      respond_to do |format|
        format.html { redirect_to works_path }
        format.json { render :json => @work }
      end
    else
      render :edit
    end
  end

  def destroy
    @work = Work.find(params[:id])
    if @work.destroy
      redirect_to works_path
    else
      render :show
    end
  end

  def show
  end

private

  def work_params
    params.require(:work).permit(:description, :title, :order_index,
      work_images_attributes: [:image, :_destroy, :id],
      links_attributes: [:text, :url, :_destroy, :id]
    )
  end

end
