document.getElementById('proxyForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const targetUrl = document.getElementById('targetUrl').value;

    fetch('/setTarget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = `/proxy`;
        } else {
            alert('Failed to set target URL');
        }
    })
    .catch(error => {
        console.error('Error setting target URL:', error);
        alert('An error occurred');
    });
});


//Function to create a star
function createStar() {
    const star = document.createElement('span');
    star.classList.add('star');

    //Randomize the position
    star.style.top = Math.random() * 150 + 'vh';
    star.style.left = Math.random() * 150 + 'vw';

    //Randomize the size of the star
    const size = Math.random() * 5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    //Append star to the container
    document.getElementById('StarContainer').appendChild(star);

    //Remove the star after a longer time
    setTimeout(() => {
        star.remove();
    }, 15000);
}

//Function to spawn stars
function spawnStars() {
    const starCount = Math.floor(Math.random() * 21) + 100;

    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            createStar();
        }, Math.random() * 1000);
    }
}

setInterval(spawnStars, 2000);
