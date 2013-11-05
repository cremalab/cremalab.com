class Admin::ImagesController < ApplicationController
  respond_to :json
  before_filter :require_login

  def create
    @image = Image.new(image_params)
    if @image.save
      render json: @image.as_json
    else
      render json: @image.errors
    end
  end

  def destroy
    @image = Image.find(params[:id])
    if @image.destroy
      render json: {message: 'image destroyed'}
    end
  end

private
  def image_params
    params.permit(:image, :imageable_id, :imageable_type)
  end
end
