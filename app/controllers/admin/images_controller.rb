class Admin::ImagesController < AdminController
  respond_to :json
  before_filter :require_login

  def create
    @image = Image.new(image_params)
    if @image.save
      render json: @image.as_json
    else
      render json: @image.errors.full_messages
    end
  end

  def destroy
    @image = Image.find(params[:id])
    if @image.destroy
      render json: {message: 'image destroyed'}
    end
  end

  def update
    @image = Image.find(params[:id])
    if @image.update_attributes(featured_params)
      render json: @image.as_json
    else
      render json: @image.errors.full_messages
    end
  end

private
  def image_params
    params.permit(:image, :imageable_id, :imageable_type, :featured)
  end
  def featured_params
    params.require(:image).permit(:featured)
  end
end
