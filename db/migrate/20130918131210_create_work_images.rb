class CreateWorkImages < ActiveRecord::Migration
  def change
    create_table :work_images do |t|
      t.string :image

      t.belongs_to :work
      t.timestamps
    end
  end
end
