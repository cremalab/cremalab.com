class UsersController < ApplicationController

  respond_to :html

  def index
    @users = User.all.order("order_index ASC")
  end

  def show
    @user = User.find_by(username: params[:id])
    @social_links = @user.profile.social_links
    @blogs = @user.blogs
  end

end
