class BlogsController < ApplicationController

  def index
    if blog_user
      @blogs = blog_user.blogs.active.order("published_at DESC").page(params[:page]).per(5)
    else
      @blogs = Blog.active.order("published_at DESC").page(params[:page]).per(5)
    end
    render :index, status: 200
  end

  def show
    @blog = Blog.find(params[:id])
    if !current_user && !@blog.is_published?
      raise ActiveRecord::RecordNotFound
    else
      render :show, status: 200
    end
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
