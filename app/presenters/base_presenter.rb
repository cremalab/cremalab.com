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
    renderer = Redcarpet::Render::HTML.new(
      with_toc_data: true
    )
    options = {
      fenced_code_blocks: true,
      autolink: true,
      space_after_headers: true,
      hightlight: true,
      footnotes: true,
      with_toc_data: true,
      tables: true,
      strikethrough: true,
      no_styles: true
    }
    Redcarpet::Markdown.new(renderer, options).render(text).html_safe
  end

end