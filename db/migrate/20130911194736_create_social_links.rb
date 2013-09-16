class CreateSocialLinks < ActiveRecord::Migration
  def change
    create_table :social_links do |t|
      t.string :username
      t.string :full_url
      t.string :network
      t.belongs_to :profile

      t.timestamps
    end
  end
end
