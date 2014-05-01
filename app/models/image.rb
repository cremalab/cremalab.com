class Image < ActiveRecord::Base
  mount_uploader :image, ImageUploader
  belongs_to :imageable, polymorphic: true

  def self.featured
    where(featured: true).order("created_at DESC")
  end

  symbolize :template, :in => [
    :none, :iphone, :ipad, :browser, :header, :listing
  ], scopes: true, allow_nil: true

  def thumb
    self.filename
  end

end
