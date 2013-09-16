class BlogsController < ApplicationController
  def index
    if blog_user
      if current_user
        @blogs = blog_user.blogs.order("published_at DESC").page(params[:page]).per(5)
      else
        @blogs = blog_user.blogs.published.order("published_at DESC").page(params[:page]).per(5)
      end
    else
      if current_user
        @blogs = Blog.all.order("published_at DESC").page(params[:page]).per(5)
      else
        @blogs = Blog.published.order("published_at DESC").page(params[:page]).per(5)
      end
    end
    render :index, status: 200
  end

  def new
    @blog = Blog.new()
    if blog_user
      @user = blog_user
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
      @user = blog_user
      @blog = @blog
      render :edit
    end
  end

  def show
    @blog = Blog.find(params[:id])
    render :show, status: 200
  end

  def edit
    @blog = Blog.find(params[:id])
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
      redirect_to blogs_path
    else
      render @blog
    end
  end

private

  def blog_params
    params.require(:blog).permit(:title, :content, :published_at, :user_id)
  end

  def blog_user
    if params[:user_id]
      return User.find_by(username: params[:user_id])
    else
      return false
    end
  end

end
