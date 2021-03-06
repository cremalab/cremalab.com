require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module CremalabCom
  class Application < Rails::Application
    config.assets.initialize_on_precompile = false
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    config.action_view.field_error_proc = Proc.new do |html_tag, instance|
      if html_tag =~ /<(input|label|textarea|select)/
        error_class = 'error'
     
        doc = Nokogiri::XML(html_tag)
        doc.children.each do |field|
          unless field['type'] == 'hidden'
            unless field['class'] =~ /\berror\b/
              field['class'] = "#{field['class']} error".strip
            end
          end
        end
        
        doc.to_html.html_safe
      else
        html_tag
      end
    end

  end
end
