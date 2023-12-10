// wait for DOM to fully load before it executes scripts
document.addEventListener('DOMContentLoaded', (event) => {
    // event listener for the review search form submission
    document.getElementById('search-reviews-form').addEventListener('submit', async (e) => {
        // prevents the default form submission behavior
        e.preventDefault(); 

        // get the values from the form
        const buildingName = document.getElementById('search-building_name').value;
        const floor = document.getElementById('search-floor').value;
        const gender = document.getElementById('search-gender').value;

        try {
            // send a GET request to your server's /reviews/search endpoint
            const response = await fetch(`/reviews/search?building_name=${encodeURIComponent(buildingName)}&floor=${floor}&gender=${encodeURIComponent(gender)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // assuming the response is a JSON object containing the search results
            const data = await response.json();

            // update the DOM with the search results
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = ''; // Clear previous results

            // create and append elements for each result
            data.forEach(review => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                // HTML template for the review card
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
                // append the card to the results div
                resultsDiv.appendChild(cardDiv);
            });
            // attach event listeners to like buttons for each review
            document.querySelectorAll('.like-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    // fetch request to like a review and update the like count
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
                        
                        // update the like count in the DOM
                        document.getElementById(`like-count-${reviewId}`).textContent = result.like_count;
                    } catch (error) {
                        console.error('Error liking the review:', error);
                    }
                });
            });
            // attach event listeners to share buttons for each review
            document.querySelectorAll('.share-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const reviewCard = event.target.closest('.card');
                    // share the review content with the shareReview function
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


// function to handle sharing a review
async function shareReview(reviewCard) {
    // extract review content and encode it for sharing via URL
    const reviewContent = reviewCard.textContent.trim();
    const tweetText = encodeURIComponent(`RateMyToilet Review: ${reviewContent}`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    // ppen the Twitter share URL in a new tab.
    window.open(twitterShareUrl, '_blank');
}
