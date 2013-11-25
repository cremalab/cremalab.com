class Admin::DashboardController < AdminController

  before_filter :require_login
  layout 'admin'

  def index
    @blogs = Blog.all.order("published_at DESC").page(params[:page]).per(20)
    @work  = Work.all.order("order_index ASC").page(params[:page]).per(20)
  end

end
