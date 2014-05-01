class CreateCareers < ActiveRecord::Migration
  def change
    create_table :careers do |t|
      t.string :name
      t.text :description
      t.text :must_haves
      t.text :bonus_points

      t.timestamps
    end
  end
end
