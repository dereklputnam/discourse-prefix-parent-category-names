import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  // Check if settings is available
  if (typeof settings === "undefined") {
    console.warn("Prefix Parent Category Names: settings not available");
    return;
  }

  // Parse enabled categories from settings
  const enabledCategories = settings.enabled_categories
    ? settings.enabled_categories.split("|").map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : [];

  if (!enabledCategories.length) {
    return;
  }

  // Get separator from settings
  const separator = settings.separator || " > ";

  // Function to update sidebar category names with parent category names
  const updateSidebarCategoryNames = () => {
    try {
      // Get all categories from Discourse
      const site = api.container.lookup("site:main");
      if (!site || !site.categories) {
        return;
      }
      const siteCategories = site.categories;
      if (!siteCategories || !siteCategories.length) {
        return;
      }

      // Find all sidebar category links
      const sidebarCategoryLinks = document.querySelectorAll(".sidebar-section-link-wrapper a.sidebar-section-link");

      sidebarCategoryLinks.forEach(link => {
        if (!link) return;
      // Extract category ID from the link's href attribute
      const href = link.getAttribute("href");
      if (!href || !href.includes("/c/")) return;
      
      const match = href.match(/\/c\/(?:.*\/)?(\d+)/);
      if (!match || !match[1]) return;
      
      const categoryId = parseInt(match[1], 10);
      
      // Check if this is one of our enabled categories
      if (!enabledCategories.includes(categoryId)) return;
      
      // Find the category in the site categories
      const category = siteCategories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      // Check if it has a parent category
      if (!category.parent_category_id) return;
      
      // Find the parent category
      const parentCategory = siteCategories.find(cat => cat.id === category.parent_category_id);
      if (!parentCategory) return;
      
      // Get the span that contains the category name
      const nameSpan = link.querySelector(".sidebar-section-link-content-text");
      if (!nameSpan) return;
      
      // Get the current text and check if it already has the parent name
      const currentText = nameSpan.textContent.trim();
      
      // Get the original category name (without parent prefix)
      const categoryName = category.name;
      
      // If currentText already includes the parent name, don't add it again
      if (currentText.startsWith(parentCategory.name)) return;
      
        // Check if text already contains the parent prefix to avoid duplication
        if (currentText === categoryName) {
          // Update the name to include the parent category name (no separator for sidebar)
          nameSpan.textContent = `${parentCategory.name}${categoryName}`;
        }
      });
    } catch (error) {
      console.error("Prefix Parent Category Names: Error in updateSidebarCategoryNames", error);
    }
  };

  // Store the original banner texts (as a global in-memory cache)
  const originalBannerTexts = {};
  
  // Function to update the category banner title
  const updateCategoryBannerTitle = () => {
    try {
      // We need to verify we're on a category page first
      if (!document.body || !document.body.classList.contains("category")) {
        return;
      }

      // Get category info from the discovery service
      const discoveryService = api.container.lookup("service:discovery");
      const category = discoveryService?.category;
    
    if (!category) {
      return;
    }
    
    const categoryId = category.id;
    
    // Find the banner title using various selectors
    const possibleSelectors = [
      "h1.custom-banner__title",
      ".custom-banner__title",
      ".category-title h1",
      ".category-heading h1"
    ];
    
    let bannerTitle = null;
    
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        bannerTitle = element;
        break;
      }
    }
    
    if (!bannerTitle) {
      return;
    }
    
    // Get the current title text
    const currentTitle = bannerTitle.textContent.trim();
    
    // Always reset the banner to the category name first
    // This ensures we don't accumulate prefixes
    bannerTitle.textContent = category.name;
    
    // If this is not one of our enabled categories or it doesn't have a parent, we're done
    if (!enabledCategories.includes(categoryId)) {
      return;
    }
    
    // Check if it has a parent category
    if (!category.parent_category_id) {
      return;
    }

      // Get all categories from Discourse
      const site = api.container.lookup("site:main");
      if (!site || !site.categories) {
        return;
      }
      const siteCategories = site.categories;
      const parentCategory = siteCategories.find(cat => cat && cat.id === category.parent_category_id);

      if (!parentCategory) {
        return;
      }

      // Update the title to include the parent category name
      bannerTitle.textContent = `${parentCategory.name}${separator}${category.name}`;
    } catch (error) {
      console.error("Prefix Parent Category Names: Error in updateCategoryBannerTitle", error);
    }
  };

  // Function to update category badges in topic lists
  const updateTopicListCategories = () => {
    try {
      // Get all categories from Discourse
      const site = api.container.lookup("site:main");
      if (!site || !site.categories) {
        return;
      }
      const siteCategories = site.categories;
      if (!siteCategories || !siteCategories.length) {
        return;
      }

      // Find all category badge links ONLY in topic lists (exclude category boxes)
      // Target badges within topic list items, not in category box sections
      const categoryBadges = document.querySelectorAll(
        ".topic-list-item .badge-category__name, " +
        ".topic-list tbody .badge-category__name, " +
        ".latest-topic-list-item .badge-category__name"
      );

      categoryBadges.forEach(badge => {
        if (!badge) return;
      // Try to find category ID from various attributes
      let categoryId = null;

      // Check parent link's href
      const parentLink = badge.closest("a");
      if (parentLink) {
        const href = parentLink.getAttribute("href");
        if (href && href.includes("/c/")) {
          const match = href.match(/\/c\/(?:.*\/)?(\d+)/);
          if (match && match[1]) {
            categoryId = parseInt(match[1], 10);
          }
        }
      }

      // Check data attributes
      if (!categoryId) {
        const wrapper = badge.closest("[data-category-id]");
        if (wrapper) {
          categoryId = parseInt(wrapper.getAttribute("data-category-id"), 10);
        }
      }

      if (!categoryId || !enabledCategories.includes(categoryId)) return;

      // Find the category
      const category = siteCategories.find(cat => cat.id === categoryId);
      if (!category || !category.parent_category_id) return;

      // Find the parent category
      const parentCategory = siteCategories.find(cat => cat.id === category.parent_category_id);
      if (!parentCategory) return;

      // Get current text
      const currentText = badge.textContent.trim();
      const categoryName = category.name;

      // If already has parent prefix, skip
      if (currentText.startsWith(parentCategory.name)) return;

        // Update with parent prefix
        if (currentText === categoryName) {
          badge.textContent = `${parentCategory.name}${separator}${categoryName}`;
        }
      });
    } catch (error) {
      console.error("Prefix Parent Category Names: Error in updateTopicListCategories", error);
    }
  };

  // Function to apply all updates with error handling
  const applyUpdates = () => {
    try {
      updateSidebarCategoryNames(); // Concatenates parent+child without separator
      updateCategoryBannerTitle();
      updateTopicListCategories();
    } catch (error) {
      console.error("Prefix Parent Category Names: Error applying updates", error);
    }
  };

  // Throttle function to limit how often updates run
  let throttleTimer = null;
  const throttledApplyUpdates = () => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      applyUpdates();
      throttleTimer = null;
    }, 100);
  };

  // Run once on initialization
  applyUpdates();

  // Update when page changes
  api.onPageChange(() => {
    applyUpdates();
  });

  // Watch for dynamically loaded content with throttling
  const observer = new MutationObserver(() => {
    throttledApplyUpdates();
  });

  // Observe changes to the main content area
  const targetNode = document.querySelector("#main-outlet");
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }
});