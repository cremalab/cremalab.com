class JobQuestionnaire
  include ActiveAttr::Model

    attribute :full_name
    attribute :email
    attribute :phone
    attribute :portfolio_website
    attribute :gh_name
    attribute :why_cremalab
    attribute :about_yourself
    attribute :anything_else

    validates_presence_of :full_name,
      :email,
      :why_cremalab,
      :about_yourself

end