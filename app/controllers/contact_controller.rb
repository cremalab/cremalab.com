class ContactController < ApplicationController
  def new
    @message = Message.new
  end

  def create
    @message = Message.new(params[:message])
    if @message.valid?
      # TODO send message here
      ContactMailer.contact_email(@message).deliver
      redirect_to root_url, notice: "Message sent! Thank you for contacting us."
    else
      render "new"
    end
  end
private

  def message_params
    params.require(:message).permit(
      :email, :name, :content
    )
  end
end