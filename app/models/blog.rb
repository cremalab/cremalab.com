class Blog < ActiveRecord::Base
  belongs_to :user
  has_many :images, as: :imageable, :dependent => :destroy
  acts_as_taggable
  unless (ARGV & ['assets:precompile', 'assets:clean']).any?
    acts_as_taggable
  end
  accepts_nested_attributes_for :images, allow_destroy: true

  validates_presence_of :title, :content

  def to_param
    "#{self.id}-#{self.title.parameterize}"
  end

  def is_published?
    published_at <= Time.now && self.published == true
  end

  def self.active
    where("published = ? AND published_at <= ?", true, Time.now)
  end

  def featured_image
    self.images.featured.first
  end

  def older_post
    self.class.first(:conditions => ["published_at < ? AND published = true", published_at], :order => "published_at desc")
  end

  def newer_post
    self.class.first(:conditions => ["published_at > ? AND published = true", published_at], :order => "published_at asc")
  end

end
