class CreateWorks < ActiveRecord::Migration
  def change
    create_table :works do |t|
      t.text :description
      t.string :title

      t.timestamps
    end
  end
end
