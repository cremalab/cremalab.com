class AddTemplateFileNameToWorks < ActiveRecord::Migration
  def change
    add_column :works, :template_file_name, :string
  end
end
