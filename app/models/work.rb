class Work < ActiveRecord::Base
  has_many :links, as: :linkable, :dependent => :destroy
  has_many :images, as: :imageable, :dependent => :destroy

  accepts_nested_attributes_for :images, allow_destroy: true
  accepts_nested_attributes_for :links, allow_destroy: true

  validates_presence_of :title
  validates_presence_of :template, :if => Proc.new{|w| w.templated == true }

  symbolize :template, :in => [
    :browser, :ios
  ]

  def self.active
    where(published: true)
  end

end
