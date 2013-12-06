class Admin::WorksController < AdminController

  before_filter :require_login
  before_filter :check_publish, only: [:create, :update]
  respond_to :html, :json

  def index
    @works = Work.all.order("order_index ASC")
    render :index
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
        format.html { redirect_to admin_works_path }
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
      :published, :templated,
      images_attributes: [:image, :_destroy, :id],
      links_attributes: [:text, :url, :_destroy, :id]
    )
  end

  def check_publish
    if params[:commit] && params[:commit].include?("Publish")
      params[:work][:published] = true
    end
  end

end
