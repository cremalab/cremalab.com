class UrlGenerator
  URL_PREFIXES = {
    twitter: 'http://twitter.com/',
    github: 'https://github.com/'
  }
  def initialize(link_model)

    @link_model = link_model
  end
  def url
    return URL_PREFIXES[@link_model.type] + @link_model.username
  end
end