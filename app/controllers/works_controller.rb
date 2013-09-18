class WorksController < ApplicationController
  def index
    @works = Work.all
  end

  def new
    @work = Work.new
  end

  def create
    @work = Work.new(work_params)
    if @work.save
      redirect_to works_path
    else
      render :new
    end
  end

  def update
    @work = Work.find(params[:id])
    if @work.update_attributes(work_params)
      redirect_to works_path
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
    params.require(:work).permit(:description, :title,
      work_images_attributes: [:image],
      links_attributes: [:text, :url]
    )
  end

end
