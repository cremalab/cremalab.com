CremalabCom::Application.routes.draw do


  get "images/create"
  get "images/destroy"
  root 'home#index'
  get "approach" => 'home#approach', :as => "approach"
  get "logout" => "sessions#destroy", :as => "logout"
  get "login" => "sessions#new", :as => "login"
  get "signup" => "users#new", :as => "signup"
  get 'style' => redirect('style.html')

  get "contact"  => 'contact#new'
  post "contact" => 'contact#create'

  resources :sessions
  resources :users, path: 'team' do
    resources :blogs
  end
  resources :blogs, path: 'blog' do
    get 'page/:page', :action => :index, :on => :collection
  end

  get 'blog/categories/:id' => 'blogs#category'

  resources :works, path: 'work'

  namespace :admin do
    get "/" => 'dashboard#index'
    resources :images
    resources :users, path: 'team' do
      resources :blogs
    end
    resources :blogs do
      resources :images
    end
    resources :blogs, path: 'blog' do
      resources :images
    end
    resources :works, path: 'work'
  end

  # TODO: Maybe restructure routes like Wordpress'?
  get "/2012/07/asana/", :to => redirect("/blog/4-best-ways-to-use-asana-as-an-web-agency")
  get "/2013/11/imagine-the-future", :to => redirect("/blog/7-imagine-the-future")
  get "/2013/12/working-with-chaplin-js-part-1-inheritance-and-views/", :to => redirect("/blog/8-working-with-chaplin-js-part-1-inheritance-and-views")
  get "/2013/11/just-one/", :to => redirect("/blog/6-just-one")
  get "/2013/03/the-turnstone-transformation/", :to => redirect("/blog/2-the-turnstone-of-transformation")
  get "/2013/02/culture-at-cremalab/", :to => redirect("/blog/1-culture-at-cremalab")

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
