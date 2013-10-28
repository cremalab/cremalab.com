class AddPublishedToBlogAndWork < ActiveRecord::Migration
  def change
    add_column :blogs, :published, :boolean, default: false
    add_column :works, :published, :boolean, default: false
  end
end
