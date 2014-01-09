class AddTemplateToImages < ActiveRecord::Migration
  def change
    add_column :images, :template, :string
  end
end
