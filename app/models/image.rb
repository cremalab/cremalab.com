class Image < ActiveRecord::Base
  mount_uploader :image, ImageUploader
  belongs_to :imageable, polymorphic: true

  def self.featured
    where(featured: true).order("created_at DESC")
  end

end
