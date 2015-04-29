class AddExternalUrlToCareers < ActiveRecord::Migration
  def change
    add_column :careers, :external_url, :string
  end
end
