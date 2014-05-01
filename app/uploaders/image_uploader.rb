# encoding: utf-8

class ImageUploader < BaseImageUploader

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end
  process :fix_exif_rotation, :if => :image?
  process :resize_to_width => [1000, 1000], :if => :image?

  # Process files as they are uploaded:
  # process :scale => [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  def fix_exif_rotation
    unless @file.extension.downcase == 'svg'
      manipulate! do |img|
        img.tap(&:auto_orient)
      end
    end
  end

  # Create different versions of your uploaded files:
  version :display, :if => :image? do
    process :quality => 65
  end

  version :thumb, :if => :image? do
    process :resize_to_fit => [300, 300]
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:

  private
  def image?(new_file)
    return new_file.extension.downcase != 'svg'
  end
  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end
