class Work < ActiveRecord::Base
  has_many :links, as: :linkable, :dependent => :destroy
  has_many :images, as: :imageable, :dependent => :destroy

  accepts_nested_attributes_for :images, allow_destroy: true
  accepts_nested_attributes_for :links, allow_destroy: true

  def self.active
    where(published: true)
  end

end
