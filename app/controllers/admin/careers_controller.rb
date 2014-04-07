class Admin::CareersController < AdminController
  before_filter :require_login
  before_filter :check_publish, only: [:create, :update]

  def index
    @careers = Career.all
    render :index, status: 200
  end

  def new
    @career = Career.new
  end


  def create
    @career = Career.new(career_params)
    if @career.save
      respond_with @career
    else
      render :new
    end

  end

  def show
    @career = Career.find(params[:id])
  end

  def edit
    @career = Career.find(params[:id])
  end

  def update
    @career = Career.find(params[:id])
    if @career.update_attributes(career_params)
      redirect_to admin_career_path(@career)
    else
      render :edit
    end

  end

  def destroy
    @career = Career.find(params[:id])
    if @career.destroy
      redirect :index
    else
      render @career
    end

  end

  private

  def career_params
    params.require(:career).permit(:name, :description, :must_haves,
                                    :bonus_points)

  end

end
