module PictureHelper
  def picture_tag(filename)
    content_tag(:div, class: "picture", style: "background-image: url('/assets/#{filename}')") do
      concat tag(:img, src: "/assets/#{filename}")
    end
  end
end