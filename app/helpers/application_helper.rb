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
end
