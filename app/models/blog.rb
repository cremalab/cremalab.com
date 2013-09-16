class Blog < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :title, :content

  scope :published, -> { where("published_at <= ?", Time.now) }

  def to_param
    "#{self.id}-#{self.title.parameterize}"
  end

  def is_published?
    published_at <= Time.now
  end


end
