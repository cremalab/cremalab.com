class BaseImageUploader < CarrierWave::Uploader::Base
  def extension_white_list
    %w(jpg jpeg gif png svg)
  end

  def resize_to_width(width, height)
    manipulate! do |img|
      if img[:width] >= width
        img.resize "#{width}x#{img[:height]}"
      end
      if img[:height] >= height && img[:width] < width
        img.resize "#{img[:height]}x#{height}"
      end
      img = yield(img) if block_given?
      img
    end
  end
end