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

  def show
    @blog = Blog.find(params[:id])
    render :show, status: 200
  end

  def category
    @blogs = Blog.tagged_with(params[:id]).order("published_at DESC").page(params[:page]).per(5)
    render :index
  end

private

  def blog_user
    if params[:user_id]
      return User.find_by(username: params[:user_id])
    else
      return false
    end
  end

end
