class AddActiveToProfile < ActiveRecord::Migration
  def change
    add_column :profiles, :active, :boolean, default: true
  end
end
