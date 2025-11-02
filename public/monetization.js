/**
 * Monetization Ad Script
 * Rewarded interstitial ad integration
 * libtl.com SDK
 */

// This function will be available after the libtl.com script loads
window.show_10119514 = window.show_10119514 || function() {
    return new Promise((resolve, reject) => {
        try {
            // This is a fallback if the script hasn't loaded yet
            console.warn('Monetization script not fully loaded, using fallback');
            // Simulate ad completion after 15 seconds
            setTimeout(() => {
                alert('You have seen an ad!');
                resolve();
            }, 15000);
        } catch (error) {
            console.error('Error showing ad:', error);
            resolve(); // Don't block user flow
        }
    });
};
