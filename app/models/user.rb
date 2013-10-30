class User < ActiveRecord::Base
  authenticates_with_sorcery!
  before_save :set_username

  has_many :blogs, foreign_key: "user_id"
  has_one :profile, dependent: :destroy

  accepts_nested_attributes_for :profile

  validates_confirmation_of :password
  validates_presence_of :password, :on => :create
  validates_presence_of :email
  validates_uniqueness_of :email
  validates_associated :profile

  def to_param
    "#{self.username}"
  end

  def set_username
    self.username = profile.full_name.parameterize
  end

  def full_name
    "#{profile.first_name} #{profile.last_name}"
  end

end
