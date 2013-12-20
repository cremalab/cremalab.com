class AddTemplatedToWorks < ActiveRecord::Migration
  def change
    add_column :works, :templated, :boolean, default: false
  end
end
