class AddOrderIndexToWork < ActiveRecord::Migration
  def change
    add_column :works, :order_index, :integer, default: 0
  end
end
