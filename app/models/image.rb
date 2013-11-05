class Image < ActiveRecord::Base
  mount_uploader :image, ImageUploader
  belongs_to :imageable, polymorphic: true

  # before_create :default_name

  def default_name
    self.name ||= File.basename(image.filename, '.*').titleize if image
  end

end
