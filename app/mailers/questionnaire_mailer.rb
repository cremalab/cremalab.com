class QuestionnaireMailer < ActionMailer::Base
  default to: "info@cremalab.com, rob@cremalab.com"

  def questionnaire_email(message)
    @message = message
    mail(from: @message.email, subject: 'Job Application')
  end
end
