class RedoWorkImagesAsImages < ActiveRecord::Migration
  def change
    drop_table :work_images

    create_table :images do |t|
      t.string :image
      t.references :imageable, polymorphic: true

      t.timestamps
    end
  end
end
