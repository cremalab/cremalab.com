class CreateBlogs < ActiveRecord::Migration
  def change
    create_table :blogs do |t|
      t.string :title
      t.text :content
      t.references :user, index: true

      t.datetime :published_at

      t.timestamps
    end
  end
end
