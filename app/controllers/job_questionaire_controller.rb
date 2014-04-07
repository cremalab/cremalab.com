class JobQuestionaireController < ApplicationController
  def new
    @job_questionaire = JobQuestionaire.new
  end


  def create
    @job_questionaire = JobQuestionaire.new(questionaire_params)
    if @job_questionaire.valid?
      QuestionaireMailer.questionaire_email(@job_questionaire).deliver

      render :json => @job_questionaire, status: 200
    else
      render :json => @job_questionaire, status: 200
    end

  end

  private

  def questionaire_params
    params.require(:questionaire).permit(:full_name, :email,
                                          :phone, :portfolio_website,
                                          :gh_name, :why_cremalab,
                                          :about_yourself, :anything_else)
  end
end
