class Admin::BlogsController < ApplicationController

  before_filter :require_login
  before_filter :check_publish, only: [:create, :update]

  def index
    if blog_user
      @blogs = blog_user.blogs.order("published_at DESC").page(params[:page]).per(5)
    else
      @blogs = Blog.all.order("published_at DESC").page(params[:page]).per(5)
    end
    render 'blogs/index', status: 200
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
    add_new_images
    if @blog.save
      redirect_to blog_path(@blog)
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
      redirect_to blog_path(@blog)
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
    params.require(:blog).permit(
      :title, :content, :published_at,
      :user_id, :tag_list, :published, :new_image_ids
    )
  end

  def blog_user
    if params[:user_id]
      return User.find_by(username: params[:user_id])
    else
      return false
    end
  end

  def check_publish
    if params[:commit] and params[:commit].include?("Publish")
      params[:blog][:published] = true
    end
  end

  def add_new_images
    ids = params[:new_image_ids]
    if ids
      ids = ids.split(',')
      for id in ids
        @blog.images << Image.find(id)
      end
    end
  end

end
