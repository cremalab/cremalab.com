class WorkPresenter < BasePresenter

  def description
    markdown(@object.description)
  end

  def title
    @object.title
  end

  def title_link
    h.link_to @object.title, h.work_path(@object)
  end

  def admin_links
    if h.current_user
      h.link_to 'Edit', h.edit_admin_work_path(@object)
    end
  end

  def showcase
    h.render partial: "/works/templates/#{@object.template.to_s}", locals: {work: @object}
  end

  def state
    if @object.published == true
      "Published"
    else
      "Draft"
    end
  end

end