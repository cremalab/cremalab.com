class Work < ActiveRecord::Base
  has_many :links, as: :linkable
  has_many :work_images
end
