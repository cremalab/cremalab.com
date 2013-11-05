class BlogImage < ActiveRecord::Base
    mount_uploader :image, ImageUploader
    belongs_to :blog
end