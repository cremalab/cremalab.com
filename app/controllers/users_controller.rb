class UsersController < ApplicationController

  before_filter :require_login
  respond_to :html


  def index
    @users = User.all
  end

  def show
    @user = User.find_by(username: params[:id])
    @social_links = @user.profile.social_links
    @blogs = @user.blogs
  end

end
