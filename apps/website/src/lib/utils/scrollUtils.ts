/**
 * Utility functions for scroll-related functionality
 */

/**
 * Scroll to a specific section with smooth behavior
 * @param sectionId - The ID of the section to scroll to
 * @param offset - Optional offset from the top (useful for fixed headers)
 */
export function scrollToSection(sectionId: string, offset: number = 80): void {
  const element = document.getElementById(sectionId);
  if (!element) return;
  
  // Get the element's position relative to the viewport
  const rect = element.getBoundingClientRect();
  
  // Calculate the absolute position by adding the scroll position
  const absoluteTop = rect.top + window.scrollY;
  
  // Scroll to the element with smooth behavior
  window.scrollTo({
    top: sectionId === 'hero' ? 0 : absoluteTop - offset,
    behavior: 'smooth'
  });
  
  // Update URL hash without scrolling
  history.pushState(null, '', sectionId === 'hero' ? window.location.pathname : `#${sectionId}`);
}

/**
 * Get the current section based on scroll position
 * @param sectionIds - Array of section IDs to check
 * @param offset - Optional offset for detection (default: 50% of viewport)
 * @returns The ID of the current section
 */
export function getCurrentSection(sectionIds: string[], offset: string = '-50% 0px'): string {
  // Default to first section if none are visible
  let currentSection = sectionIds[0];
  
  // Create a temporary IntersectionObserver to check all sections immediately
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          currentSection = entry.target.id;
        }
      });
    },
    { rootMargin: offset }
  );
  
  // Observe all sections
  sectionIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }
  });
  
  // Disconnect after checking (we're just using this for an immediate check)
  setTimeout(() => observer.disconnect(), 100);
  
  return currentSection;
}

/**
 * Set up intersection observers for sections
 * @param sectionIds - Array of section IDs to observe
 * @param callback - Callback function when a section becomes active
 * @param offset - Optional offset for detection (default: 50% of viewport)
 * @returns Cleanup function to disconnect observers
 */
export function observeSections(
  sectionIds: string[], 
  callback: (_sectionId: string) => void,
  offset: string = '-50% 0px'
): () => void {
  const observers: IntersectionObserver[] = [];
  
  const observerOptions = {
    root: null, // viewport
    rootMargin: offset,
    threshold: 0 // Trigger as soon as even 1px is visible
  };
  
  // Create an observer for each section
  sectionIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Pass the section ID to the callback when it becomes visible
            callback(id);
          }
        });
      }, observerOptions);
      
      observer.observe(element);
      observers.push(observer);
    }
  });
  
  // Return cleanup function
  return () => {
    observers.forEach(observer => observer.disconnect());
  };
}