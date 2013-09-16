class Blog < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :title, :content

  def to_param
    "#{self.id}-#{self.title.parameterize}"
  end
end
