class AddJobTitleToProfile < ActiveRecord::Migration
  def change
    add_column :profiles, :job_title, :string
  end
end
