class Message
  include ActiveAttr::Model

  attribute :name
  attribute :email
  attribute :content

  validates_presence_of :name
  validates_format_of :email, :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i
  validates_length_of :content, :maximum => 500
end