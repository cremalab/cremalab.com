class JobQuestionnaireController < ApplicationController
  def new
    @job_questionnaire = JobQuestionnaire.new
  end


  def create
    @job_questionnaire = JobQuestionnaire.new(questionnaire_params)
    if @job_questionnaire.valid?
      QuestionnaireMailer.questionnaire_email(@job_questionnaire).deliver

      redirect_to job_questionnaire_success_path()
    else
      render :new, status: 422
    end

  end

  def success
    render :success
  end

  private

  def questionnaire_params
    params.require(:job_questionnaire).permit(:full_name, :email,
                                          :phone, :portfolio_website,
                                          :gh_name, :why_cremalab,
                                          :about_yourself, :anything_else)
  end
end
