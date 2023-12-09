
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('search-reviews-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the values from the form
        const buildingName = document.getElementById('search-building_name').value;
        const floor = document.getElementById('search-floor').value;
        const gender = document.getElementById('search-gender').value;

        try {
            // Send a GET request to your server's /reviews/search endpoint
            const response = await fetch(`/reviews/search?building_name=${encodeURIComponent(buildingName)}&floor=${floor}&gender=${encodeURIComponent(gender)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Assuming the response is a JSON object containing the search results
            const data = await response.json();

            // Update the DOM with the search results
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = ''; // Clear previous results

            // Create and append elements for each result
            data.forEach(review => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.innerHTML = `
                    <h3>${review.building_name} - Floor ${review.floor_number} (${review.gender})</h3>
                    <p><strong>User:</strong> ${review.username}</p>
                    <p><strong>Cleanliness:</strong> ${review.cleanliness}/5</p>
                    <p><strong>Poopability:</strong> ${review.poopability}/5</p>
                    <p><strong>Overall Rating:</strong> ${review.overall_rating}/5</p>
                    <p><strong>Peacefulness:</strong> ${review.peacefulness}/5</p>
                    <p><strong>Comments:</strong> ${review.additional_comments}</p>
                    <p><strong>Likes:</strong> <span id="like-count-${review.review_id}">${review.like_count}</span></p>
                    <button class="like-button" data-review-id="${review.review_id}">Like</button>
                    <button class="share-btn">Share</button>
                `;
                resultsDiv.appendChild(cardDiv);
            });
            document.querySelectorAll('.like-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const reviewId = event.target.getAttribute('data-review-id');
                    try {
                        const response = await fetch('/reviews/like', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ review_id: reviewId })
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const result = await response.json();
                        
                        // Update the like count in the DOM
                        document.getElementById(`like-count-${reviewId}`).textContent = result.like_count;
                    } catch (error) {
                        console.error('Error liking the review:', error);
                    }
                });
            });
            document.querySelectorAll('.share-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const reviewCard = event.target.closest('.card');
                    if (reviewCard) {
                        await shareReview(reviewCard);
                    }
                });
            });    
            
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });
});

async function shareReview(reviewCard) {
    const reviewContent = reviewCard.textContent.trim();
    const tweetText = encodeURIComponent(`RateMyToilet Review: ${reviewContent}`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterShareUrl, '_blank');
}
