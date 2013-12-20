require "html_truncate"

class BlogPresenter < BasePresenter

  def content
    h.find_and_preserve(markdown(@object.content)).html_safe
  end

  def author_link
    h.link_to "#{@object.user.profile.full_name}", h.user_blogs_path(@object.user)
  end

  def author_avatar
    h.image_tag @object.user.profile.avatar.thumb, alt: @object.user.full_name
  end

  def path
    h.blog_path(@object)
  end

  def title
    @object.title
  end

  def title_link
    h.link_to @object.title, h.blog_path(@object)
  end

  def published_at
    h.link_to @object.published_at.strftime("%B %d, %Y"), h.blog_path(@object)
  end

  def publish_info
    "By #{author_link} on #{published_at}".html_safe
  end

  def featured_image
    if @object.featured_image.nil?
      # TODO: CHANGE THIS TO A DEFAULT IMAGE
      "https://www.google.com/logos/doodles/2013/raymond-loewys-120th-birthday-ca-fr-us-nl-uk-ie-6388231276855296-hp.jpg"
    else
      @object.featured_image.image.url
    end
  end

  def tag_list
    list = h.content_tag(:div)
    last = @object.tags[@object.tags.length - 1]
    @object.tags.collect do |tag|
      spacing = tag == last ? "" : ", "
      list.concat(h.link_to(tag.name, "/blog/categories/#{tag.name.downcase}", class: 'tag') + spacing)
    end
    list.html_safe
  end

  def excerpt
    content.truncate_html(500).html_safe
  end

  def text_excerpt
    if @object.excerpt
      @object.excerpt.truncate(140)
    else
      @object.content.truncate(140)
    end
  end

  def twitter_username
    sl = @object.user.profile.social_links.where(network: 'twitter').first
    if sl
      @object.user.profile.social_links.where(network: 'twitter').first.username
    else
      nil
    end
  end

end