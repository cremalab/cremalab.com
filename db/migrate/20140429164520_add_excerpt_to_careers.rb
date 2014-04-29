class AddExcerptToCareers < ActiveRecord::Migration
  def change
    add_column :careers, :excerpt, :text
  end
end
