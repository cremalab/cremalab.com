class UsersController < ApplicationController

  before_filter :require_login_from_http_basic, :only => [:login_from_http_basic]

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to root_url, :notice => "Signed up!"
    else
      render :new
    end
  end

  def update
  end

  def show
  end

  def login_from_http_basic
    redirect_to users_path, :notice => 'Login from basic auth successful'
  end

private
  def user_params
    params.require(:user).permit(:password, :password_confirmation, :email )
  end

end
