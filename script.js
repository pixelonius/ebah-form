document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const feedbackForm = document.getElementById('feedbackForm');
    const starsContainer = document.getElementById('starsContainer');
    const submitBtn = document.getElementById('submitBtn');
    const complaintText = document.getElementById('complaintText');
    const thankYouMessage = document.getElementById('thankYouMessage');

    const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL;
    const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

    let currentRating = 0;

    // Helper to color stars up to an index
    function highlightStars(index) {
        stars.forEach(star => {
            const value = parseInt(star.dataset.value);
            if (value <= index) {
                star.classList.add('gold');
            } else {
                star.classList.remove('gold');
            }
        });
    }

    stars.forEach(star => {
        // Mouseover: highlight all stars up to current one
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.dataset.value);
            highlightStars(value);
        });

        // Click: set rating
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            currentRating = value;

            if (value >= 4) {
                // Redirect immediately
                window.location.href = REDIRECT_URL;
            } else {
                // Show feedback form, hide stars to prevent changing rating?
                // Request says simply "opens a second page" (or shows section).
                // Let's hide the stars to focus on feedback or keep them?
                // "if the rating is under 4 stars, a second page with a text box opens"
                // interpreted as showing the form below.

                feedbackForm.classList.remove('hidden');
                // Ensure the stars stay lit based on the clicked rating even if mouse leaves
                highlightStars(value);
            }
        });
    });

    // Mouseout from container: reset to current selected rating
    starsContainer.addEventListener('mouseleave', () => {
        highlightStars(currentRating);
    });

    submitBtn.addEventListener('click', async () => {
        const text = complaintText.value;
        if (!text.trim()) {
            alert('Please enter your feedback.');
            return;
        }

        // Disable button to prevent double submit
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // "sends the text to a webhook"
            // Usually webhooks expect JSON
            // Get 'id' from URL query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const reviewId = urlParams.get('id');

            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: currentRating,
                    complaint: text,
                    id: reviewId
                })
            });

            // We can't really know if it succeeded with 'no-cors' for opaque responses,
            // but we assume it went through. If the user provided a real backend with CORS, remove mode: 'no-cors'.

            feedbackForm.classList.add('hidden');
            thankYouMessage.classList.remove('hidden');

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('There was an error submitting your feedback. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
        }
    });
});
