module PictureHelper
  def picture_tag(filename, subClass = nil)
    content_tag(:div, class: "picture #{subClass}", style: "background-image: url(#{image_path(filename)})") do
      concat tag(:img, src: image_path(filename))
    end
  end
end