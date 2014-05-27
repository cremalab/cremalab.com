class JobQuestionnaire
  include ActiveAttr::Model

    attribute :full_name
    attribute :email
    attribute :phone
    attribute :portfolio_website
    attribute :linked_in
    attribute :behance
    attribute :dribble
    attribute :salary
    attribute :front_end
    attribute :last_two_projects
    attribute :excited_about
    attribute :difficult_problem
    attribute :three_websites
    attribute :favorite_app
    attribute :change_app
    attribute :knowlegable
    attribute :why_cremalab
    attribute :about_yourself

    validates_presence_of :full_name,
      :email,
      :why_cremalab,
      :about_yourself

end