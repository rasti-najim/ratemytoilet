// Event listener for DOMContentLoaded event to ensure the DOM is fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', (event) => {
    // Event listener for the review form submission
    document.getElementById('add-review-form').addEventListener('submit', async (e) => {
        // Prevent default form submission behavior
        e.preventDefault();

        // Fetch request to post a new review
        const response = await fetch('/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Gather form data and convert it to JSON
            body: JSON.stringify({
                // Displayed data
                username: document.getElementById('username').value,
                building_name: document.getElementById('building_name').value,
                floor: document.getElementById('floor').value,
                gender: document.getElementById('gender').value,
                cleanliness: document.getElementById('cleanliness').value,
                poopability: document.getElementById('poopability').value,
                overall_rating: document.getElementById('overall_rating').value,
                peacefulness: document.getElementById('peacefulness').value,
                additional_comments: document.getElementById('additional_comments').value,
                grade: document.getElementById('grade').value, 
            }),
        });
        // Parse the JSON response and show an alert with the message
        const data = await response.json();
        alert(data.message);
    
        // Reset the form after successful submission
        document.getElementById('add-review-form').reset();
    });

    // Fetch and display a random review
    document.getElementById('random-review-btn').addEventListener('click', async () => {
        // Error handling for fetch request
        try {
            const response = await fetch('/random-review');
            const randomReview = await response.json();
            displayRandomReview(randomReview);
        } catch (error) {
            console.error('Error fetching random review:', error);
        }
    });

    // Implement function to display the random review
    function displayRandomReview(randomReview) {
        // Code to display the review
        const container = document.getElementById('random-review-container');
        // Make sure the html is consistent with all other card elements (wherever each review is displayed)
        const reviewHtml = `
            <div class="card">
            <h3>${randomReview.building_name} - Floor ${randomReview.floor_number} (${randomReview.gender})</h3>
            <p><strong>User:</strong> ${randomReview.username}</p>
            <p><strong>Cleanliness:</strong> ${randomReview.cleanliness}/5</p>
            <p><strong>Poopability:</strong> ${randomReview.poopability}/5</p>
            <p><strong>Overall Rating:</strong> ${randomReview.overall_rating}/5</p>
            <p><strong>Peacefulness:</strong> ${randomReview.peacefulness}/5</p>
            <p><strong>Comments:</strong> ${randomReview.additional_comments}</p>
            <p><strong>Likes:</strong> <span id="like-count-${randomReview.review_id}">${randomReview.like_count}</span></p>
            <button class="like-button" data-review-id="${randomReview.review_id}">Like</button>
            <button class="share-btn">Share</button>
            </div>`;
        container.innerHTML = reviewHtml;

        // Selects all elements with the like-button class and iterates over each one
        document.querySelectorAll('.like-button').forEach(button => {
            // event listener for the 'click' event
            button.addEventListener('click', async (event) => {
                // Retrieves the review ID stored in the 'data-review-id' attribute
                const reviewId = event.target.getAttribute('data-review-id');
                // Wraps the fetch request in a try-catch block for error handling
                try {
                    // Sends an asynchronous fetch request to the server to "like"
                    const response = await fetch('/reviews/like', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        // Sends the review ID in the request body as a JSON string
                        body: JSON.stringify({ review_id: reviewId })
                    });
                    // Checks if the fetch request was not successful
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const result = await response.json();
                    
                    // Update the like count in the DOM file for the specific review
                    // Finds the element by constructing its ID using the review ID and updates its text content
                    document.getElementById(`like-count-${reviewId}`).textContent = result.like_count;
                } catch (error) {
                    console.error('Error liking the review:', error);
                }
            });
        });
        // Selects all elements with the share-btn class and iterates over each one
        document.querySelectorAll('.share-btn').forEach(button => {
            // add event listener
            button.addEventListener('click', async (event) => {
                // Finds the closest parent element with the class 'card'
                // used to get the entire review card that contains the clicked share button
                const reviewCard = event.target.closest('.card');
                // Checks if a review card element was successfully found
                if (reviewCard) {
                    await shareReview(reviewCard);
                }
            });
        });
      }
    }
    
);


// async function to handle liking a review
async function likeReview(reviewId) {
   
    // log the attempt to like review
    console.log('Attempting to like review with ID:', reviewId);
    // error handling
    try {
        const response = await fetch('/reviews/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ review_id: reviewId }),
        });
        // parse the response data
        const data = await response.json();
        if (response.ok) {
            // update the like count in the DOM.
            const likeCountElement = document.querySelector(`#like-count-${reviewId}`);
            likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
        } else {
            // display error
            console.error('Failed to add like:', data.message);
        }
    } catch (error) {
        // display error
        console.error('Error liking review:', error);
    }
}

// Function to fetch and render all reviews
async function fetchAndRenderAllReviews() {
    // fetch request to get all reviews
    const response = await fetch('/reviews');
    const reviews = await response.json();

    // map over the reviews to create HTML content for each
    // HTML template for each review
    const reviewsHtml = reviews.map(review => `
        <div class="card">
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
            </div>
    `).join('');
    
    // Update the DOM with the reviews
    document.getElementById('all-reviews').innerHTML = reviewsHtml;

    // Add click event listeners to like buttons after rendering the reviews
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            // handle the like button click
            // Fetch request to like a review and update the like count in the DOM
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
    // Adding click event listeners to SHARE buttons
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            // handle the share button click
            // call the shareReview function with the review card element
            const reviewCard = event.target.closest('.card');
            if (reviewCard) {
                await shareReview(reviewCard);
            }
        });
    }).catch(error => console.error('Error fetching data:', error));
}


function searchByCategory() {
    // get the selected category and rating from the input elements
    const categorySelect = document.getElementById('categorySelect');
    const category = categorySelect.value;
  
    const categoryRatingInput = document.getElementById('categoryRatingInput');
    const rating = categoryRatingInput.value;
  
    // fetch the reviews from the server
    fetch(`/reviews/searchByCategory?category=${category}&rating=${rating}`)
      .then(response => response.json())
      .then(data => {
        // display the reviews in a card format
        const reviewsByCategoryDiv = document.getElementById('reviewsByCategory');
        reviewsByCategoryDiv.innerHTML = ''; // Clear any previous results
  
        data.forEach(review => {
          // construct the HTML for each review
          const reviewCard = `
            <div class="card">
              <h3>${review.building_name}</h3>
              <p>Floor: ${review.floor_number}</p>
              <p>Gender: ${review.gender}</p>
              <p>Username: ${review.username}</p>
              <p>Cleanliness: ${review.cleanliness}</p>
              <p>Poopability: ${review.poopability}</p>
              <p>Overall Rating: ${review.overall_rating}</p>
              <p>Peacefulness: ${review.peacefulness}</p>
              <p>Comments: ${review.additional_comments}</p>
              <p><strong>Likes:</strong> <span id="like-count-${review.review_id}">${review.like_count}</span></p>
              <button class="like-button" data-review-id="${review.review_id}">Like</button>
              <button class="share-btn">Share</button>
            </div>`;
          
          // append the review card HTML to the reviewsByCategoryDiv
          reviewsByCategoryDiv.innerHTML += reviewCard;
        });

        // Add click event listeners to like buttons after rendering the reviews
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const reviewId = event.target.getAttribute('data-review-id');
                // error handling
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
        // same process for the SHARE buttons
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const reviewCard = event.target.closest('.card');
                if (reviewCard) {
                    await shareReview(reviewCard);
                }
            });
        });
      })
      .catch(error => console.error('Error fetching data:', error));

      
  }
  
// event listener for the 'fetch-most-reviews' button click
document.getElementById('fetch-most-reviews').addEventListener('click', async () => {
    // fetch request to get data for the user with the most reviews
    const response = await fetch('/reviews/most_by_user');
    const user = await response.json();
    // construct HTML to display the user's information
    const userHtml = `
        <div class="card">
            <h3>${user.username}</h3>
            <p><strong>Review Count:</strong> ${user.review_count}</p>
        </div>
    `;
    // update DOM
    document.getElementById('most-reviews').innerHTML = userHtml;
});


// event listener for the entire document, after it has fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    // event delegation for click events on the document's body
    document.body.addEventListener('click', function(event) {
        // checking if the clicked element has the 'share-btn' class
        if (event.target.classList.contains('share-btn')) {
            const reviewCard = event.target.closest('.card').textContent;
            // call function if a review is found
            if (reviewCard) {
                shareReview(reviewCard);
            }
        }
    });

    document.getElementById('search-reviews-form').addEventListener('submit', async (e) => {
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
                const div = document.createElement('div');
                div.className = 'review';
                div.innerHTML = `<h3>${review.building_name} - Floor: ${review.floor_number} (${review.gender})</h3><p>Cleanliness: ${review.cleanliness}, Poopability: ${review.poopability}, Overall Rating: ${review.overall_rating}, Peacefulness: ${review.peacefulness}, Comments: ${review.additional_comments}, Likes: ${review.like_count}</p>`;
                resultsDiv.appendChild(div);
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });
});



// async function for handling the endpoint for most reviewed reviews
async function handleMostReviews() {
    const response = await fetch('/reviews/most_by_user');
    const user = await response.json();

    // construct HTML to display the user's information.
    const userHtml = `
        <div class="card">
            <h3>${user.username}</h3>
            <p><strong>Review Count:</strong> ${user.review_count}</p>
        </div>
    `;
    // update DOM for this specific funtionality
    document.getElementById('most-reviews').innerHTML = userHtml;
}


// similar async function for reviews of top grades
async function topGrades(){
    const response = await fetch('/reviews/top_grades');
    const grades = await response.json();
    
    // map over the grades to create HTML for each.
    const gradesHtml = grades.map(grade => `
        <div class="card">
            <h3>${grade.grade_name}</h3>
            <p><strong>Review Count:</strong> ${grade.review_count}</p>
        </div>
    `).join('');
    
    // update DOM
    document.getElementById('top-grades').innerHTML = gradesHtml;
};


// Clearing the inner HTML of different sections
async function handleClearReviews() {
    document.getElementById('all-reviews').innerHTML = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('most-reviews').innerHTML = '';
    document.getElementById('top-grades').innerHTML = '';
    document.getElementById('top-liked-reviews').innerHTML = '';
    document.getElementById('reviewsByCategory').innerHTML = '';
}


// event listener for clicking like-button
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('like-button')) {
        const reviewId = event.target.dataset.reviewId;
        likeReview(reviewId);
    }
});


// async function for getting the most liked reviews
async function fetchTopLiked() {
    // error handling
    try {
        const response = await fetch('/reviews/top_liked');
        const reviews = await response.json();
        
        // generate HTML for each review
        const topReviewsHtml = reviews.map(review => `
            <div class="card">
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
            </div>
        `).join('');
        
        // insert the reviews HTML into the DOM
        const topReviewsContainer = document.getElementById('top-liked-reviews');
        topReviewsContainer.innerHTML = topReviewsHtml;

        // add event listeners to each 'Like' button (similar to previous steps)
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const reviewId = event.target.getAttribute('data-review-id');
                // error handling
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
        // add event listeners to each 'Share' button (similar to previous steps)
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const reviewCard = event.target.closest('.card');
                if (reviewCard) {
                    await shareReview(reviewCard);
                }
            });
        });

    } catch (error) {
        console.error('Error fetching the top liked reviews:', error);
    }
};


// async function for the shareReview function mentioned in the event listener
async function shareReview(reviewCard) {
    const reviewContent = reviewCard.textContent.trim();
    // acquire the text
    const tweetText = encodeURIComponent(`RateMyToilet Review: ${reviewContent}`);
    // attach the link to share the twitter text
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    // open the window for sharing the tweet
    window.open(twitterShareUrl, '_blank');
}
