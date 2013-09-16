class BlogPresenter < BasePresenter

  def content
    markdown(@object.content)
  end

  def author_link
    h.link_to "#{@object.user.profile.full_name}", h.user_blogs_path(@object.user)
  end

  def title_link
    h.link_to @object.title, h.blog_path(@object)
  end

end