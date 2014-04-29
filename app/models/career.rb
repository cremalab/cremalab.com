class Career < ActiveRecord::Base
  validates_presence_of :description, :name

  has_many :images, as: :imageable, :dependent => :destroy
  accepts_nested_attributes_for :images, allow_destroy: true
end
