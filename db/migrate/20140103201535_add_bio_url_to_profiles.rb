class AddBioUrlToProfiles < ActiveRecord::Migration
  def change
    add_column :profiles, :bio_url, :string
  end
end
