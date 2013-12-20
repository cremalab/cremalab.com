class CreateBlogImages < ActiveRecord::Migration
  def change
    create_table :blog_images do |t|
      t.string :image

      t.belongs_to :blog
      t.timestamps
    end
  end
end
