class CareerPresenter < BasePresenter

  def name
    @object.name
  end

  def description
    if @object.description
      markdown(@object.description)
    end
  end

  def excerpt
    if @object.excerpt.blank?
      markdown(@object.description)
    else
      markdown(@object.excerpt)
    end
  end

  def name_link
    h.link_to @object.name, h.career_path(@object)
  end

  def view_opening
    h.link_to "View opening", h.career_path(@object), class: "button sub-outline"
  end

  def admin_links
    if h.current_user
      h.link_to 'Edit', h.edit_admin_career_path(@object)
    end
  end

  def must_haves
    if @object.must_haves
      markdown(@object.must_haves)
    end
  end

  def featured_image
    if @object.images.any?
      @object.images.first.image.url
    else
      "https://s3.amazonaws.com/cremalab/static/blog-bg.jpg"
    end
  end

  def listing_image
    if @object.images.where(template: :listing).any?
      image = @object.images.where(template: :listing).first
      if image.image.url.include?('.svg')
        image.image.url
      else
        image.image.url.thumb
      end
    else
      nil
    end
  end

  def bonus_points
    if @object.bonus_points
      markdown(@object.bonus_points)
    end
  end

end