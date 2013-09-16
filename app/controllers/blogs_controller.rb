class BlogsController < ApplicationController
  def index
    if blog_user
      @blogs = blog_user.blogs
    else
      @blogs = Blog.all
    end
    render :index, status: 200
  end

  def new
    @blog = Blog.new()
    if blog_user
      @user = User.find(params[:user_id])
    end
  end

  def create
    if blog_user
      @blog = blog_user.blogs.new(blog_params)
    else
      @blog = Blog.new(blog_params)
    end

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

  def blog_user
    if params[:user_id]
      return User.find(params[:user_id])
    else
      return false
    end
  end

end
