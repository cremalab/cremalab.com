module ApplicationHelper
  def present(object, klass = nil)
    klass ||= "#{object.class.name}Presenter".constantize
    presenter = klass.new(object, self)
    yield presenter if block_given?
    presenter
  end
  def title(page_title)
    content_for :title, " - #{page_title.to_s}"
  end
  def map_url(query)
    agent = request.env["HTTP_USER_AGENT"]
    query = query.split(" ")
    query = query.join("+")
    if agent.include? "Apple"
      "http://maps.apple.com/?q=#{query}"
    else
      "https://maps.google.com/maps?q=#{query}"
    end
  end
end
