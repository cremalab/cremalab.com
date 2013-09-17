class UsersController < ApplicationController

  before_filter :require_login
  respond_to :html


  def index
    @users = User.all
  end

  def new
    @user = User.new
    @profile = @user.build_profile
  end

  def create
    @user = User.new(user_params)
    if @user.save
      auto_login(@user)
      redirect_to root_url, :notice => "Signed up!"
    else
      render :new
    end
  end

  def update
    @user = User.find_by(username: params[:id])
    if @user.update_attributes(user_params)
      redirect_to root_path
    else
      respond_with @user
    end
  end

  def show
    @user = User.find_by(username: params[:id])
    @social_links = @user.profile.social_links
    @blogs = @user.blogs
  end

  def edit
    @user = User.find_by(username: params[:id])
    if @user.profile.nil?
      @profile = @user.build_profile
    end
  end

private
  def user_params
    params.require(:user).permit(
      :password, :password_confirmation, :email,
      profile_attributes: [:first_name, :last_name, :title, :avatar,
        social_links_attributes: [
          :username, :full_url, :network, :_destroy
        ]
      ]
    )
  end

end
