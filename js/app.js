document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const token = localStorage.getItem('api_token');

    // Always show the View Posts button
    document.getElementById('viewPostsBtn').style.display = 'inline-block';

    if (!token) {
        document.getElementById('createPostBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    } else {
        document.getElementById('createPostBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'none';
    }

    document.getElementById('registerBtn').addEventListener('click', function(event) {
        event.preventDefault();

        contentDiv.innerHTML = `
            <div class="container">
                <h2>Register</h2>
                <form id="register-form">
                    <label for="name">Name</label>
                    <input type="text" name="name" id="name" required>
                    <label for="email">Email</label>
                    <input type="email" name="email" id="email" required>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" required>
                    <label for="password_confirmation">Confirm Password</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" required>
                    <input type="submit" value="Register">
                </form>
                <div id="register-response"></div>
            </div>
        `;
        attachRegisterEvent();
    });

    document.getElementById('loginBtn').addEventListener('click', loginFormShow);

    function loginFormShow() {
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Login</h2>
                <form id="login-form">
                    <label for="email">Email</label>
                    <input type="email" name="email" id="login-email" required>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="login-password" required>
                    <input type="submit" value="Login">
                </form>
                <div id="login-response"></div>
            </div>
        `;
        attachLoginEvent();
    }

    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });

    document.getElementById('createPostBtn').addEventListener('click', function() {
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Create Post</h2>
                <form id="create-post-form">
                    <label for="title">Title</label>
                    <input type="text" name="title" id="title" required>
                    <label for="body">Body</label>
                    <textarea name="body" id="body" required></textarea>
                    <input type="submit" value="Create">
                </form>
                <div id="post-data"></div>
            </div>
        `;
        attachCreatePostEvent();
    });

    document.getElementById('viewPostsBtn').addEventListener('click', function() {
        contentDiv.innerHTML = `
            <div class="container">
                <h2>Posts</h2>
                <div id="user-posts"></div>
            </div>`;
        
        // Fetch and display posts without checking for token
        fetchAllPosts();
    });

    loginFormShow();
});

function attachRegisterEvent() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const password_confirmation = document.getElementById('password_confirmation').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name, email, password, password_confirmation
                })
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById('register-response').innerText = 'Registration successful!';
            } else {
                document.getElementById('register-response').innerText = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function attachLoginEvent() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email, password
                })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('api_token', data.token);
                document.getElementById('login-response').innerText = `Login successful! Token saved.`;
                
                document.getElementById('createPostBtn').style.display = 'inline-block';
                document.getElementById('viewPostsBtn').style.display = 'inline-block';
                document.getElementById('logoutBtn').style.display = 'inline-block';

                document.getElementById('registerBtn').style.display = 'none';
                document.getElementById('loginBtn').style.display = 'none';
            } else {
                document.getElementById('login-response').innerText = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function logout() {
    const token = localStorage.getItem('api_token');

    fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            localStorage.removeItem('api_token');
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('createPostBtn').style.display = 'none';
            document.getElementById('viewPostsBtn').style.display = 'inline-block';
            document.getElementById('registerBtn').style.display = 'inline-block';
            document.getElementById('loginBtn').style.display = 'inline-block';

            document.getElementById('user-posts').innerText = 'You have been logged out.';
        }
    });
}

async function fetchAllPosts() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const posts = await response.json();

        if (response.ok) {
            const postsContainer = document.getElementById('user-posts');
            postsContainer.innerHTML = '';
            posts.forEach(post => {
                postsContainer.innerHTML += 
                    `<div class="post">
                        <p><strong>Title:</strong> ${post.title}</p>
                        <p><strong>Body:</strong> ${post.body}</p>
                        ${localStorage.getItem('api_token') ? `<button onclick="deletePost(${post.id})">Delete</button>` : ''}
                    </div>`;
            });
        } else {
            document.getElementById('user-posts').innerHTML = `<p>Failed to fetch posts. ${posts.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function deletePost(postId) {
    const token = localStorage.getItem('api_token');

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Post deleted successfully!');
            fetchAllPosts(); // Refresh the post list
        } else {
            const data = await response.json();
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}


function attachCreatePostEvent() {
    const form = document.getElementById('create-post-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const body = document.getElementById('body').value;
        const token = localStorage.getItem('api_token');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, body })
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById('post-data').innerText = 'Post created successfully!';
            } else {
                document.getElementById('post-data').innerText = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}
