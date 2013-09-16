require 'test_helper'

class SocialLinkPresenterTest < ActiveSupport::TestCase

  def setup
    @user = User.create(email: 'test@cremalab.com', password: 'testtest', password_confirmation: 'testtest')
    @profile = @user.create_profile(first_name: "Guy", last_name: "Testerson")
  end

  test "should generate a twitter url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'twitter')
    @presenter = SocialLinkPresenter.new(@link, '')
    assert @presenter.url.include?('twitter.com'), true
  end

  test "should generate a github url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'github')
    @presenter = SocialLinkPresenter.new(@link, '')
    assert @presenter.url.include?('github.com'), true
  end

  test "should generate a linked_in url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'linked_in')
    @presenter = SocialLinkPresenter.new(@link, '')
    assert @presenter.url.include?('linkedin.com'), true
  end

  test "should generate a dribbble url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'dribbble')
    @presenter = SocialLinkPresenter.new(@link, '')
    assert @presenter.url.include?('dribbble.com'), true
  end

  test "should generate an rdio url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'rdio')
    @presenter = SocialLinkPresenter.new(@link, '')
    assert @presenter.url.include?('rdio.com'), true
  end

  test "should generate a generic url" do
    @link = @profile.social_links.create(username: 'cremaguy', network: 'website', full_url: 'http://www.google.com')
    @presenter = SocialLinkPresenter.new(@link, '')
    refute @presenter.url.include?('rdio.com')
    refute @presenter.url.include?('twitter.com')
    refute @presenter.url.include?('github.com')
    refute @presenter.url.include?('linkedin.com')
    refute @presenter.url.include?('dribbble.com')
  end

  def teardown
    @user.destroy
  end
end
