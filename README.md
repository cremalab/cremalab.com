cremalab.com
============

### Work Templates

If a Work needs to have its own custom markup and styles, make sure "templated?" is
checked when editing it, and then make sure the following files exist:

* app/assets/javascripts/templates/work_title_underscored_name.hamstache
* app/assets/stylesheets/works/work_title_underscored_name.css.scss

Each will get compiled separately (not mixed into application.css or application.js)
and automatically pulled in with Require when viewing the Work. Each work DOM element
has an ID of its underscored, parameterized title. For instance: "Live Blue KC" would
have an ID of `live_blue_kc`. Its template and CSS files should have the same file
name.

Each Hamstache template (regular HAML syntax) will be injected into a `.showcase` div
within the work's container element. Be sure to scope stuff in stylsheets accordingly.