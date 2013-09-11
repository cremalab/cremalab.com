class SessionsController < ApplicationController

  before_action :redirect_if_logged_in, only: [:create, :new]

  def create
    user = login(params[:email], params[:password], params[:remember_me])
    if user
      redirect_back_or_to root_url, :notice => "Logged in!"
    else
      flash.now.alert = "Email or password was invalid"
      render :new
    end
  end

  def destroy
    logout
    redirect_to root_url, :notice => "Logged out!"
  end

private

  def redirect_if_logged_in
    redirect_to root_url, :notice => "You are already logged in" if current_user
  end

end
