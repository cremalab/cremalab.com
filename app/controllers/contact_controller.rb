class ContactController < ApplicationController
  def new
    @message = Message.new
  end

  def create
    @message = Message.new(params[:message])
    if @message.valid?
      # TODO send message here
      ContactMailer.contact_email(@message).deliver
      render :json => @message, status: 200
    else
      render :json => @message.errors.full_messages, status: 422
    end
  end
private

  def message_params
    params.require(:message).permit(
      :email, :name, :content
    )
  end
end