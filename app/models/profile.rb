class Profile < ActiveRecord::Base
  belongs_to :user
  has_many :social_links

  mount_uploader :avatar, AvatarUploader

  validates_presence_of :first_name, :last_name

  accepts_nested_attributes_for :social_links, allow_destroy: true

  def full_name
    return "#{first_name} #{last_name}"
  end
  def param_name
    full_name.parameterize
  end
end
