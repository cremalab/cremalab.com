class ContactMailer < ActionMailer::Base
  default from: "no-reply@cremalab.com"
  default to: "info@cremalab.com"

  def contact_email(message)
    @message = message
    mail(from: @message.email, subject: 'From the website contact form')
  end
end
