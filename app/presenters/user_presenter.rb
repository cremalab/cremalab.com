class UserPresenter < BasePresenter
  def first_name
    @object.profile.first_name
  end
  def full_name
    @object.full_name
  end
  def blog_link
    if @object.profile.bio_url.blank?
      url = h.user_blogs_path(@object)
    else
      url = @object.profile.bio_url
    end
    h.link_to "Meet #{first_name}", url, class: "button sub-outline"
  end
  def avatar
    @object.profile.avatar
  end
  def title
    @object.profile.job_title
  end
end