
n.n.n / 2013-12-17 
==================

 * Created ScrollWatcher class with Ross — Yay
 * link admin blog title to blog on edit
 * Merge branch 'admin-rb'
 * page titles
 * buttons
 * prettifying work and user forms
 * prettifying blog admin
 * Merge branch 'work-62-rl' of github.com:cremalab/cremalab.com into admin-rb
 * FSP animation progress
 * Setting up devices for desplaying work. Initial work on FSP.
 * Initial Work styling
 * admin padding and update of hljs on preview
 * cleanup
 * Adding UserPresenter. closes #49
 * blog index title for author and category if present
 * Merge branch 'master' of github.com:cremalab/cremalab.com
 * Reordered SCSS imports to account for double-import of 'works' styles.
 * Merge pull request #61 from cremalab/contact_form-59-rb
 * Send emails via Gmail SMTP from contact form. closes #59
 * Merge pull request #58 from cremalab/animations-57-rb
 * Merge branch 'master' of github.com:cremalab/cremalab.com into animations-57-rb
 * Merge pull request #43 from cremalab/layout-42-rl
 * Merge pull request #60 from cremalab/layout_contact-14-rl
 * re-highlight on turbolinks page:load
 * Form Styles (as implemented on the Contact page)
 * Adding template_file_name to Work. closes #57
 * Adding templated attribute to Work. closes #57
 * Updated Icons for site and encorporated them into the ContactBlocks on the contact page
 * Compile HAML client-side templates and require them with require.js
 * Merged layout
 * Merge pull request #56 from cremalab/fix-whitespaces-rb
 * Added borders between contactBlocks
 * Addition of ContactBlock layout and modules
 * Fixing whitespace issues with code blocks
 * Merge pull request #55 from cremalab/layout_blog-13-rl
 * Updated schema.rb
 * Latest blog progress
 * Merge branch 'master' of github.com:cremalab/cremalab.com into layout_blog-13-rl
 * All my crazy changes. This was after the great file loss of 2013.
 * fix marked setup js
 * Merge pull request #48 from cremalab/user-title-45-rb
 * fixing syntax highlighting in editor/blog show pages
 * Merge pull request #54 from cremalab/js_namespace-rb
 * Fixing ace stylesheets not being included.
 * Admin layout that loads admin js separately
 * Merge pull request #53 from cremalab/sidebar_wait-36-rb
 * Scope sidebar animation wait to browsers that support CSS animations.
 * Wait until sidebar animation finishes before following link.
 * Blog layout skeleton
 * Restructured styles directory and added css compression on DEV
 * Merge pull request #51 from cremalab/user-sort-order-47-rb
 * Adding order_index to User. closes #47
 * Adding job_title:string to Profile. closes #45.
 * Removed test loop from _user.haml and changed class name on picture (sub-cover) to be more generic.
 * Merge pull request #46 from cremalab/layout_team-12-rl
 * Initial Team page layout (closes #12)
 * Merge pull request #44 from cremalab/layout_landing-9-rl
 * Added imageUploadForm to css modules.
 * Polishing up Landing page. Reworking some layout mechanisms that were getting hairy. (See #9)
 * Removed the text align:center in favor of margin: auto for centering grid elements. (See #42)
 * Merge pull request #39 from cremalab/refactor_layout-38-rl
 * Updated application layout
 * Update to schema.rb
 * Merged Master and resolved conflicts
 * Addition of video hash overlay
 * Updates to background video
 * Added file for breakpoints variables
 * Refactored layouts and began some basic styling on the Process page. Added 'picture_tag' helper for adding images that utilize the power of background-size without losint the content of the image. YAY
 * precompile fonts in production
 * Merge pull request #40 from cremalab/blog-uploads-35-rb
 * Merge branch 'master' into blog-uploads-35-rb
 * Featured Images. closes #35.
 * Blog Post Editor Enhancements. #35
 * Added Modicum grid. (Closes #37)
 * Merge pull request #29 from cremalab/base_styles-27-rl
 * I'm closing this branch because it's kind of old. I'm going to focus on the more specific issues.
 * Adding markdown code for images for quick copy/paste. #35
 * Upload/delete via ajax on blog forms. #35
 * Redoing WorkImages as Images, a polymorphic model. #35
 * specify ruby 2
 * Merge branch 'master' into base_styles-27-rl
 * Updated users_controller.rb because Ross said to.
 * Updated database.yml
 * merged master
 * Basic video background
 * Merge pull request #34 from cremalab/drafts-33-rb
 * Ability to mark Work/Blog as Published. closes #33
 * Merge pull request #32 from cremalab/blog-tags-31-rb
 * redirect to blog_path on create and update. #31
 * adding tags to blog posts. routes for categories. closes #31
 * remove console.log
 * Merge pull request #30 from cremalab/admin-namespace
 * remove before filters on non-admin controllers
 * drag and drop ordering of work in admin dashboard
 * Merge branch 'master' of github.com:cremalab/cremalab.com into admin-namespace
 * fix work/show
 * creating admin dashboard with list of blogs and work
 * updating links and forms for namespace.
 * add admin namespace and new controllers
 * Addition of basic global color variables. (See #28)
 * Merge pull request #26 from cremalab/typography-15-rl
 * Removed overflow: hidden on body.
 * Adjusted Heading sizes and added 'span.subHeading' class to handle Heading styles.
 * Refactored Style Structure and updated heading-scale mixin.
 * Merge branch 'master' of github.com:cremalab/cremalab.com into typography-15-rl
 * Merge pull request #25 from cremalab/work-11-rb
 * remove unneeded file
 * Apply live markdown preview to Work description. #11
 * Work form with nested image and links. CRUD views for Work. #11
 * setup WorksController. #11
 * Adding Work, WorkImage, and Links models. #11
 * require auth on blogs_controller
 * live markdown preview. kinda related to #17
 * Merge pull request #24 from cremalab/team-12-rb
 * adding views for team members at /team, see #12
 * Merge pull request #23 from cremalab/uploads-22-rb
 * added thumbnail image to profile edit form
 * set up s3 correctly. #22
 * Added carrierwave initializer. #22
 * ignore .env
 * Avatar Uploader, s3 credentials, Unicorn for Heroku
 * mount avatar uploader and install mini_magick. #22
 * Add carrierwave. #22
 * Merge pull request #21 from cremalab/pagination-20-rb
 * 5 posts per page on all index pages. closes #20
 * add kaminari. see #20
 * Merge pull request #17 from cremalab/blog-7-MAO
 * Merge pull request #19 from cremalab/blog-7-rb
 * Forms, Views, and routes for blogs and user blogs. closes #7
 * Blog form for users and nested routes with vanity urls. see #7
 * merge in master for presenter stuff
 * update schema, fix routes, add view dir. see #7
 * Merge pull request #18 from cremalab/social-links-8-rb
 * update gemfile
 * cleanup
 * SocialLinkPresenter test. see #8
 * add presenter for social_links. closes #8
 * This added fixtures
 * Scaffolded the tests for blog
 * Added the blog controller functions
 * Added blog scaffolding
 * Create Model
 * Added Avenir font (see #15)
 * Merge pull request #2 from cremalab/layouts
 * Merged in Master and resolved conflicts
 * Updated schema
 * stuff for social links. see #8
 * Merge pull request #6 from cremalab/user-profiles-5-rb
 * User profiles with forms. closes #5
 * Merge pull request #4 from cremalab/user-auth-3-rb
 * basic user authentication and sessions. closes #3
 * Adding user model and sorcery stuff
 * Refactored stylesheet organization. Menu is smoother.
 * my progress from last week
 * Initial layout including Sidebar Slideout
 * Merge branch 'master' of github.com:cremalab/cremalab.com
 * Adding Home and Contact controllers so Rob can get crankin. see #1
 * Initial commit
