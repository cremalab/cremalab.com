class WorkImage < ActiveRecord::Base
  mount_uploader :image, ImageUploader
  belongs_to :work
end
