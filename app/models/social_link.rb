class SocialLink < ActiveRecord::Base
  belongs_to :profile

  symbolize :network, :in => [
    :website, :twitter, :github,
    :linked_in, :dribbble, :rdio
  ], :scopes => true

end
