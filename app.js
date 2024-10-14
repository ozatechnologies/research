// Firebase configuration from your project
const firebaseConfig = {
    apiKey: "AIzaSyAWt-TWSk6PnuUtcwJMY5h-5RoCZI--0Oc",
    authDomain: "dev-database-a5d9d.firebaseapp.com",
    databaseURL: "https://dev-database-a5d9d.firebaseio.com",
    projectId: "dev-database-a5d9d",
    storageBucket: "dev-database-a5d9d.appspot.com",
    messagingSenderId: "195525219078",
    appId: "1:195525219078:web:ef153036d8b202cbe84487",
    measurementId: "G-YKRTM0R61H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const paperUpload = document.getElementById('paperUpload');
const paperTitle = document.getElementById('paperTitle');
const uploadBtn = document.getElementById('uploadBtn');
const paperList = document.getElementById('paperList');
const generateQRBtn = document.getElementById('generateQRBtn');
const qrCodeContainer = document.getElementById('qrCode');
const shareBtn = document.getElementById('shareBtn');

// Upload Paper Function
uploadBtn.addEventListener('click', () => {
    const file = paperUpload.files[0];
    const title = paperTitle.value;

    if (!file || !title) {
        alert("Please provide both title and paper file.");
        return;
    }

    const storageRef = storage.ref('papers/' + file.name);
    
    storageRef.put(file).then(() => {
        storageRef.getDownloadURL().then(url => {
            // Save metadata to Firestore
            db.collection('papers').add({
                title: title,
                url: url,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert('Paper uploaded successfully!');
                displayPapers();  // Refresh paper list
            });
        });
    });
});

// Display Research Papers
function displayPapers() {
    paperList.innerHTML = '';
    db.collection('papers').orderBy('timestamp', 'desc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            const paperItem = document.createElement('div');
            paperItem.classList.add('paper-item');
            paperItem.innerHTML = `<h4>${data.title}</h4><a href="${data.url}" target="_blank">Download</a>`;
            paperList.appendChild(paperItem);
        });
    });
}

// Generate QR Code for the first paper
generateQRBtn.addEventListener('click', () => {
    const firstPaperUrl = document.querySelector('.paper-item a').href;
    const qr = new QRious({
        element: qrCodeContainer,
        value: firstPaperUrl,
        size: 200
    });
});

// Share Functionality
shareBtn.addEventListener('click', () => {
    const firstPaperUrl = document.querySelector('.paper-item a').href;
    if (navigator.share) {
        navigator.share({
            title: 'Research Paper',
            url: firstPaperUrl
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(err => {
            console.log('Error while sharing:', err);
        });
    } else {
        alert('Your browser does not support the share feature.');
    }
});

// Initialize papers on page load
displayPapers();
