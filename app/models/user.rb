class User < ActiveRecord::Base
  authenticates_with_sorcery!

  has_many :blogs, foreign_key: "user_id"
  has_one :profile, dependent: :destroy

  accepts_nested_attributes_for :profile

  validates_confirmation_of :password
  validates_presence_of :password, :on => :create
  validates_presence_of :email
  validates_uniqueness_of :email

end
