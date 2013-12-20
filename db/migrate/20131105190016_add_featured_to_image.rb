class AddFeaturedToImage < ActiveRecord::Migration
  def change
    add_column :images, :featured, :boolean
  end
end
