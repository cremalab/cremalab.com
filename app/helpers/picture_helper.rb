module PictureHelper
  def picture_tag(filename, subClass = nil)
    content_tag(:div, class: "picture #{subClass}", style: "background-image: url('#{filename}')") do
      concat tag(:img, src: filename)
    end
  end
end