class SocialLinkPresenter < BasePresenter
  def initialize(social_link, template)
    super
    @social_link = social_link
    @username    = @social_link.username
    @network     = @social_link.network
  end

  def link
    h.link_to I18n.t("activerecord.symbolizes.social_link.network.#{@network}"), url, class: @network
  end

private

  def url
    self.send("#{@network}_url")
  end

  def twitter_url
    return "https://twitter.com/#{@username}"
  end

  def github_url
    return "https://github.com/#{@username}"
  end

  def linked_in_url
    return "www.linkedin.com/in/#{@username}"
  end

  def dribbble_url
    return "http://dribbble.com/#{@username}"
  end

  def rdio_url
    return "http://www.rdio.com/people/#{@username}"
  end

  def website_url
    return @social_link.full_url
  end

end