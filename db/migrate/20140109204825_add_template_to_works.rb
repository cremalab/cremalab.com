class AddTemplateToWorks < ActiveRecord::Migration
  def change
    add_column :works, :template, :string
    remove_column :works, :template_file_name
  end
end
