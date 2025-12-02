# discourse-prefix-parent-category-names

A Discourse theme component that automatically adds parent category names as prefixes to child categories throughout your Discourse site.

## Features

- Adds parent category prefixes to:
  - Sidebar category links
  - Category banner titles
  - Topic list category badges
- Customizable separator (default: " > ")
- Selective application - choose which categories should display parent prefixes
- Automatic updates for dynamically loaded content

## Installation

1. Go to your Discourse Admin Panel → Customize → Themes
2. Click "Install" → "From a Git Repository"
3. Enter the repository URL: `https://github.com/jtviolet/discourse-prefix-parent-category-names`
4. Click "Install"

## Configuration

After installation, configure the component:

1. Go to the theme component settings
2. **enabled_categories**: Select which child categories should display their parent category name as a prefix
3. **separator**: Customize the separator between parent and child category names (default: " > ")

## Example

If you have a parent category called "Product" and a child category called "Ideas", with this component enabled:
- Sidebar will show: `Product > Ideas`
- Category banner will show: `Product > Ideas`
- Topic list will show: `Product > Ideas`

## Version

Current version: 2.0

### Changelog

**v2.0**
- Added support for topic list category badges
- Added customizable separator setting
- Added MutationObserver for dynamic content
- Improved selector coverage for different Discourse versions
- Changed default format to use " > " separator

**v1.0**
- Initial release
- Sidebar and banner support