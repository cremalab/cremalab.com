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

  def published_at
    h.link_to @object.published_at.strftime("%m/%d/%y"), h.blog_path(@object)
  end

  def featured_image
    if @object.featured_image.nil?
      "https://www.google.com/logos/doodles/2013/raymond-loewys-120th-birthday-ca-fr-us-nl-uk-ie-6388231276855296-hp.jpg"
    else
      @object.featured_image.image.url
    end
  end

  def tag_list
    list = h.content_tag(:div)
    @object.tags.collect do |tag|
      list.concat(h.link_to(tag.name, "/blog/categories/#{tag.name.downcase}", class: 'tag') + " ")
    end
    list.html_safe
  end

end