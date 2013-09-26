class Work < ActiveRecord::Base
  has_many :links, as: :linkable, :dependent => :destroy
  has_many :work_images, :dependent => :destroy

  accepts_nested_attributes_for :work_images, allow_destroy: true
  accepts_nested_attributes_for :links, allow_destroy: true

end
