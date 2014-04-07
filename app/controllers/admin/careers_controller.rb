class Admin::CareersController < ApplicationController
  before_filter :require_login
  before_filter :check_publish, only: [:create, :update]

  def index
    @careers = Career.all
    render :index, status: 200
  end

  def new
    @career = Career.new
  end


  def create

  end

  def show
    @career = Career.find(params[:id])
  end

  def edit
    @career = Career.find(params[:id])
  end

  def update

  end

  def destroy

  end

end
