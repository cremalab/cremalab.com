class Admin::CareersController < AdminController
  before_filter :require_login

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
      redirect_to admin_careers_path
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
      redirect_to admin_careers_path
    else
      render :edit
    end

  end

  def destroy
    @career = Career.find(params[:id])
    if @career.destroy
      redirect admin_careers_path
    else
      render @career
    end

  end

  private

  def career_params
    params.require(:career).permit(:name, :description, :must_haves,
                                    :bonus_points, images_attributes: [
                                      :image, :id, :template, :_destroy
                                    ]
                                  )

  end

end
