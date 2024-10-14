// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWt-TWSk6PnuUtcwJMY5h-5RoCZI--0Oc",
    authDomain: "dev-database-a5d9d.firebaseapp.com",
    databaseURL: "https://dev-database-a5d9d.firebaseio.com", // Realtime Database URL
    projectId: "dev-database-a5d9d",
    storageBucket: "dev-database-a5d9d.appspot.com",
    messagingSenderId: "195525219078",
    appId: "1:195525219078:web:ef153036d8b202cbe84487",
    measurementId: "G-YKRTM0R61H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submitBtn');
const articleList = document.getElementById('articleList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const adminPanel = document.getElementById('adminPanel');
const pendingArticles = document.getElementById('pendingArticles');

// Admin Credentials (for demonstration, hard-coded here)
const adminEmail = "admin@example.com";

// Dummy Authentication (this would be a real auth system)
const currentUser = { email: "admin@example.com" };  // Set admin user

// Show admin panel if user is admin
if (currentUser.email === adminEmail) {
    adminPanel.style.display = 'block';
    loadPendingArticles();
}

// Submit new article
submitBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title && description) {
        const newArticleRef = db.ref('articles').push();
        newArticleRef.set({
            title: title,
            description: description,
            approved: false,  // Pending approval
            timestamp: Date.now()
        }).then(() => {
            alert("Article submitted successfully! Awaiting approval.");
            titleInput.value = '';
            descriptionInput.value = '';
        }).catch((error) => {
            console.error("Error submitting article:", error);
        });
    } else {
        alert("Please fill in both fields.");
    }
});
// Load approved articles
function loadApprovedArticles() {
    db.ref('articles').orderByChild('approved').equalTo(true).on('value', snapshot => {
        articleList.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const article = childSnapshot.val();
            const articleItem = document.createElement('div');
            articleItem.classList.add('article-item');
            articleItem.innerHTML = `<h4>${article.title}</h4><p>${article.description}</p>`;
            articleList.appendChild(articleItem);
        });
    });
}

// Load pending articles for admin approval
function loadPendingArticles() {
    db.ref('articles').orderByChild('approved').equalTo(false).on('value', snapshot => {
        pendingArticles.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const article = childSnapshot.val();
            const articleItem = document.createElement('div');
            articleItem.classList.add('article-item');
            articleItem.innerHTML = `
                <h4>${article.title}</h4>
                <p>${article.description}</p>
                <button onclick="approveArticle('${childSnapshot.key}')">Approve</button>
                <button onclick="rejectArticle('${childSnapshot.key}')">Reject</button>`;
            pendingArticles.appendChild(articleItem);
        });
    });
}

// Approve article
function approveArticle(id) {
    db.ref('articles/' + id).update({ approved: true }).then(() => {
        alert('Article approved.');
    });
}

// Reject article
function rejectArticle(id) {
    db.ref('articles/' + id).remove().then(() => {
        alert('Article rejected.');
    });
}

// Search articles
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        db.ref('articles').orderByChild('approved').equalTo(true).once('value', snapshot => {
            searchResults.innerHTML = '';
            snapshot.forEach(childSnapshot => {
                const article = childSnapshot.val();
                if (article.title.toLowerCase().includes(query) || article.description.toLowerCase().includes(query)) {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('article-item');
                    resultItem.innerHTML = `<h4>${article.title}</h4><p>${article.description}</p>`;
                    searchResults.appendChild(resultItem);
                }
            });
        });
    }
});

// Load approved articles on page load
loadApprovedArticles();
