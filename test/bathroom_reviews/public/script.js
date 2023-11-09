document.getElementById('add-review-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: document.getElementById('username').value,
            building_name: document.getElementById('building_name').value,
            floor: document.getElementById('floor').value,
            gender: document.getElementById('gender').value,
            cleanliness: document.getElementById('cleanliness').value,
            poopability: document.getElementById('poopability').value,
            overall_rating: document.getElementById('overall_rating').value,
            peacefulness: document.getElementById('peacefulness').value,
            additional_comments: document.getElementById('additional_comments').value,
        }),
    });

    const data = await response.json();
    alert(data.message);

    // Reset the form after successful submission
    document.getElementById('add-review-form').reset();
});

/* async function likeReview(reviewId) {
    try {
        const response = await fetch('/reviews/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ review_id: reviewId }),
        });
        const data = await response.json();
        if (response.ok) {
            const likeCountElement = document.querySelector(`#like-count-${reviewId}`);
            if (likeCountElement) {
                likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
            }
        } else {
            console.error('Failed to add like:', data.message);
        }
    } catch (error) {
        console.error('Error liking review:', error);
    }
}*/

async function likeReview(reviewId) {
   
    console.log('Attempting to like review with ID:', reviewId);
    try {
        const response = await fetch('/reviews/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ review_id: reviewId }),
        });
        const data = await response.json();
        if (response.ok) {
            const likeCountElement = document.querySelector(`#like-count-${reviewId}`);
            likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
        } else {
            console.error('Failed to add like:', data.message);
        }
    } catch (error) {
        console.error('Error liking review:', error);
    }
}


/*async function likeReview(reviewId) {
    try {
        const response = await fetch('/reviews/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ review_id: reviewId }),
        });
        const data = await response.json();
        if (data.message === "Like added successfully!") {
            const likeCountElement = document.getElementById(`like-count-${reviewId}`);
            likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
        } else {
            console.error('Failed to add like:', data.message);
        }
    } catch (error) {
        console.error('Error liking review:', error);
    }
}*/


document.getElementById('fetch-all-reviews').addEventListener('click', async () => {
    const response = await fetch('/reviews');
    const reviews = await response.json();

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
        </div>
    `).join('');
    
    document.getElementById('all-reviews').innerHTML = reviewsHtml;
});


function searchByCategory() {
    // Get the selected category and rating from the input elements
    const categorySelect = document.getElementById('categorySelect');
    const category = categorySelect.value;
  
    const categoryRatingInput = document.getElementById('categoryRatingInput');
    const rating = categoryRatingInput.value;
  
    // Fetch the reviews from the server
    fetch(`/reviews/searchByCategory?category=${category}&rating=${rating}`)
      .then(response => response.json())
      .then(data => {
        // Display the reviews in a card format
        const reviewsByCategoryDiv = document.getElementById('reviewsByCategory');
        reviewsByCategoryDiv.innerHTML = ''; // Clear any previous results
  
        data.forEach(review => {
          // Construct the HTML for each review
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
            </div>`;
          
          // Append the review card HTML to the reviewsByCategoryDiv
          reviewsByCategoryDiv.innerHTML += reviewCard;
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  

document.getElementById('search-reviews-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch(`/reviews/search?building_name=${document.getElementById('search-building_name').value}&floor=${document.getElementById('search-floor').value}&gender=${document.getElementById('search-gender').value}`);
    const reviews = await response.json();
    
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
        </div>
    `).join('');
    
    document.getElementById('search-results').innerHTML = reviewsHtml;
});

document.getElementById('fetch-most-reviews').addEventListener('click', async () => {
    const response = await fetch('/reviews/most_by_user');
    const user = await response.json();
    
    const userHtml = `
        <div class="card">
            <h3>${user.username}</h3>
            <p><strong>Review Count:</strong> ${user.review_count}</p>
        </div>
    `;
    
    document.getElementById('most-reviews').innerHTML = userHtml;
});


document.getElementById('fetch-top-grades').addEventListener('click', async () => {
    const response = await fetch('/reviews/top_grades');
    const grades = await response.json();
    
    const gradesHtml = grades.map(grade => `
        <div class="card">
            <h3>${grade.grade_name}</h3>
            <p><strong>Review Count:</strong> ${grade.review_count}</p>
        </div>
    `).join('');
    
    document.getElementById('top-grades').innerHTML = gradesHtml;
});



document.getElementById('hide-all-reviews1').addEventListener('click', () => {
    document.getElementById('all-reviews').innerHTML = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('most-reviews').innerHTML = '';
    document.getElementById('top-grades').innerHTML = '';
});



document.addEventListener('click', function(event) {
    if (event.target.classList.contains('like-button')) {
        const reviewId = event.target.dataset.reviewId;
        likeReview(reviewId);
    }
});



document.getElementById('fetch-top-liked-reviews').addEventListener('click', async () => {
    try {
        const response = await fetch('/reviews/top_liked');
        const reviews = await response.json();
        
        // Generate HTML for each review
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
            </div>
        `).join('');
        
        // Insert the reviews HTML into the DOM
        const topReviewsContainer = document.getElementById('top-liked-reviews');
        topReviewsContainer.innerHTML = topReviewsHtml;

        // Add event listeners to each 'Like' button
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

    } catch (error) {
        console.error('Error fetching the top liked reviews:', error);
    }
});
