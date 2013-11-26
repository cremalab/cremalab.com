class AddOrderIndexToUsers < ActiveRecord::Migration
  def change
    add_column :users, :order_index, :integer
  end
end
