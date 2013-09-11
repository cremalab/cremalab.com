class CreateProfiles < ActiveRecord::Migration
  def change
    create_table :profiles do |t|
      t.string :first_name
      t.string :last_name
      t.belongs_to :user

      t.timestamps
    end
    add_column :users, :profile_id, :integer
  end
end
