class Profile < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :first_name, :last_name

  def full_name
    return "#{first_name} #{last_name}"
  end
end
