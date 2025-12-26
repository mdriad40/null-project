// Login page authentication handler
(function () {
    'use strict';

    const auth = firebase.auth();
    const database = firebase.database();

    // Set persistence to SESSION so the user stays logged in when redirecting to admin.html
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .catch((error) => {
            console.error('Error setting persistence:', error);
        });

    // Check if already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Check if user exists in admin_users and is not blocked
            database.ref('admin_users/' + user.uid).once('value').then((snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.blocked) {
                    showError('Your account has been temporarily blocked. Please contact the administrator.');
                    auth.signOut();
                } else if (userData) {
                    window.location.href = 'admin.html';
                } else {
                    showError('User configuration incomplete. Please sign in again.');
                    auth.signOut();
                }
            });
        }
    });

    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginButton = document.getElementById('loginButton');

        hideAllMessages();

        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';

        try {
            // Sign in with Firebase Authentication
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Check if user exists in admin_users database
            const snapshot = await database.ref('admin_users/' + user.uid).once('value');
            let userData = snapshot.val();

            // Auto-create user in database if missing
            if (!userData) {
                userData = {
                    name: email.split('@')[0],
                    email: email,
                    mobile: "N/A",
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    createdBy: "system_auto_provision",
                    blocked: false,
                    isMainAdmin: false
                };
                await database.ref('admin_users/' + user.uid).set(userData);
            }

            if (userData.blocked) {
                showError('Your account has been temporarily blocked. Please contact the administrator.');
                await auth.signOut();
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
                return;
            }

            // Update last login time
            await database.ref('admin_users/' + user.uid).update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });

            showSuccess('Login successful! Redirecting...');

            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 500);

        } catch (error) {
            console.error('Login error:', error);

            let errorMsg = 'An error occurred during login.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMsg = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMsg = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMsg = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMsg = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-credential':
                    errorMsg = 'Invalid email or password. Please check your credentials.';
                    break;
                case 'auth/too-many-requests':
                    errorMsg = 'Too many failed login attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMsg = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMsg = error.message || errorMsg;
            }

            showError(errorMsg);
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        }
    });

    function showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.classList.remove('show');
    }

    function showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        successElement.textContent = message;
        successElement.classList.add('show');
    }

    function hideSuccess() {
        const successElement = document.getElementById('successMessage');
        successElement.classList.remove('show');
    }

    function hideAllMessages() {
        hideError();
        hideSuccess();
    }
})();
