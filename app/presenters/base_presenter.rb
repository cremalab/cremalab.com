class BasePresenter
  def initialize(object, template)
    @object = object
    @template = template
  end

  def self.presents(name)
    define_method(name) do
      @object
    end
  end

  def h
    @template
  end

  def markdown(text)
    renderer = Redcarpet::Render::HTML
    options = {
      autolink: true,
      space_after_headers: true,
      prettify: true
    }
    Redcarpet::Markdown.new(renderer, options).render(text).html_safe
  end

end