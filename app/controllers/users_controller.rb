class UsersController < ApplicationController

  respond_to :html

  def index
    pids = Profile.where(active: true).pluck(:user_id)
    @users = User.where(id: pids).order("order_index ASC")
  end

  def show
    @user = User.find_by(username: params[:id])
    @social_links = @user.profile.social_links
    @blogs = @user.blogs
  end

end
