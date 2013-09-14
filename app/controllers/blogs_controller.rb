class BlogsController < ApplicationController
  def index
    @blogs = Blog.all
    render :index, status: 200

  end

  def create
    @blog = Blog.new(blog_params)
    if @blog.save
      render :show, status: 201
    else
      render :json => @blog.errors.full_messages, status: 422
    end

  end

  def show
    @blog = Blog.find(params[:id])
    render :show, status: 200
  end

  def update
    @blog = Blog.find(params[:id])
    if @blog.update_attributes(blog_params)
      render :show, status: :ok
    else
      render :show, status: :unprocessable_entity
    end

  end

  def destroy
    @blog = Blog.find(params[:id])
    if @blog.destroy
      render :json => ['Blog destroyed'], status: :ok
    else
      render :show, status: :unprocessable_entity
    end
  end
  private
    def blog_params
      params.require(:blog).permit(:title, :content, :published_at, :user_id)
    end
end
