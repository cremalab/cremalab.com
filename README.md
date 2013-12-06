cremalab.com
============

### Work Templates

If a Work needs to have its own custom markup and styles, make sure "templated?" is
checked when editing it, and then make sure the following files exist:

* app/assets/javascripts/templates/#{template_file_name}.hamstache
* app/assets/stylesheets/works/#{template_file_name}.css.scss

Each will get compiled separately (not mixed into application.css or application.js)
and automatically pulled in with Require when viewing the Work. Each work DOM element
has an ID of its template_file_name. Its template and CSS files should have the file
name, which is set in the admin under the "Template File Name" field.

Each Hamstache template (regular HAML syntax) will be injected into a `.showcase` div
within the work's container element. Be sure to scope stuff in stylsheets accordingly.