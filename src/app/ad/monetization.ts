/**
 * Monetization Ad Integration
 * This file handles the rewarded interstitial ad display
 */

// Declare the monetization function type
export interface MonetizationAd {
  show_10119514: () => Promise<void>;
}

// Global monetization ad function
declare global {
  interface Window extends MonetizationAd {
    show_10119514?: () => Promise<void>;
  }
}

/**
 * Show the monetization ad
 * Returns a promise that resolves when the ad is watched
 */
export async function showMonetizationAd(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window !== 'undefined' && window.show_10119514) {
        window
          .show_10119514()
          .then(() => {
            // User has watched the ad
            console.log('Ad watched successfully!');
            resolve();
          })
          .catch((error) => {
            console.error('Error showing ad:', error);
            // Continue anyway - don't block user if ad fails
            resolve();
          });
      } else {
        // Ad function not available, continue anyway
        console.warn('Monetization ad function not available');
        resolve();
      }
    } catch (error) {
      console.error('Error in showMonetizationAd:', error);
      resolve(); // Don't block user flow
    }
  });
}

// Load monetization script if not already loaded
export function loadMonetizationScript(): void {
  if (typeof window === 'undefined') return;

  // Check if script already loaded
  if (window.show_10119514) {
    return;
  }

  // Add script tag for monetization (if needed)
  // This depends on your monetization provider's implementation
  // For now, we assume the function is provided by an external script
  // that should be included in your HTML head or via a script tag
}

