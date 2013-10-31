class Blog < ActiveRecord::Base
  belongs_to :user
  unless (ARGV & ['assets:precompile', 'assets:clean']).any?
    acts_as_taggable
  end

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


end
