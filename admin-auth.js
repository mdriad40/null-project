// User Management System for Admin Panel
// Firebase Authentication based system

(function () {
    'use strict';

    const MAIN_ADMIN_EMAIL = 'publictrial00@gmail.com';
    let currentUser = null;
    let isMainAdmin = false;
    let currentUserData = null;

    // Initialize Firebase Auth and Database
    const auth = firebase.auth();
    const database = firebase.database();

    // Check authentication state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;

            // Check if user exists in admin_users and is not blocked
            try {
                const snapshot = await database.ref('admin_users/' + user.uid).once('value');
                const userData = snapshot.val();

                if (!userData) {
                    alert('You are not authorized to access the admin panel.');
                    await auth.signOut();
                    window.location.href = 'index.html';
                    return;
                }

                if (userData.blocked) {
                    alert('Your account has been temporarily blocked. Please contact the administrator.');
                    await auth.signOut();
                    window.location.href = 'index.html';
                    return;
                }

                // Store user data
                currentUserData = userData;

                // Check if main admin
                isMainAdmin = (user.email === MAIN_ADMIN_EMAIL || userData.isMainAdmin === true);

                // Show/hide user management menu item
                const userManagementMenuItem = document.getElementById('userManagementMenuItem');
                if (userManagementMenuItem) {
                    userManagementMenuItem.style.display = isMainAdmin ? 'flex' : 'none';
                }

                // Update user avatar
                const userAvatar = document.getElementById('userAvatar');
                if (userAvatar && userData.name) {
                    userAvatar.textContent = userData.name.charAt(0).toUpperCase();
                    userAvatar.title = userData.name + ' - Click to view profile';
                }

                // Initialize user management if main admin
                if (isMainAdmin) {
                    initializeUserManagement();
                }

                // Initialize profile modal
                initializeProfileModal();

                // Initialize Edit User Modal
                if (isMainAdmin) {
                    initializeEditUserModal();
                }

            } catch (error) {
                console.error('Error checking user data:', error);
                // Don't sign out immediately on error, might be temporary network issue
                // But if critical data is missing, we might need to.
            }

        } else {
            // No user logged in, redirect to login
            window.location.href = 'index.html';
        }
    });

    // Initialize Profile Modal
    function initializeProfileModal() {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.style.cursor = 'pointer';
            userAvatar.addEventListener('click', showProfileModal);
        }
    }

    // Show Profile Modal
    function showProfileModal() {
        let modal = document.getElementById('profileModal');
        if (!modal) {
            modal = createProfileModal();
            document.body.appendChild(modal);
        }

        updateProfileModalContent();

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // Create Profile Modal
    function createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'profile-modal';
        modal.innerHTML = `
      <div class="profile-modal-overlay"></div>
      <div class="profile-modal-content">
        <div class="profile-modal-header">
          <h2 style="margin:0;font-size:20px;font-weight:600;color:var(--text);">Profile Information</h2>
          <button class="profile-modal-close" id="profileModalClose">×</button>
        </div>
        <div class="profile-modal-body" id="profileModalBody">
          <!-- Content will be dynamically inserted -->
        </div>
        <div class="profile-modal-footer">
          <button class="ghost-btn" id="profileLogoutBtn">Logout</button>
        </div>
      </div>
    `;

        modal.querySelector('.profile-modal-overlay').addEventListener('click', closeProfileModal);
        modal.querySelector('#profileModalClose').addEventListener('click', closeProfileModal);
        modal.querySelector('#profileLogoutBtn').addEventListener('click', handleLogout);

        return modal;
    }

    // Update Profile Modal Content
    function updateProfileModalContent() {
        const bodyEl = document.getElementById('profileModalBody');
        if (!bodyEl || !currentUserData) return;

        const mainAdminBadge = isMainAdmin ? '<span style="background:rgba(108,99,255,0.2);color:var(--primary);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;margin-left:8px;">MAIN ADMIN</span>' : '';

        let mainAdminControls = '';
        if (isMainAdmin) {
            mainAdminControls = `
                <div style="margin-top:24px;border-top:1px solid var(--outline);padding-top:16px;">
                    <h3 style="font-size:14px;color:var(--text);margin-bottom:12px;">Security Settings</h3>
                    <div style="display:grid;gap:12px;">
                         <button class="ghost-btn small" id="btnChangeEmail" style="justify-content:center;">Change My Email</button>
                         <button class="ghost-btn small" id="btnChangePassword" style="justify-content:center;">Change My Password</button>
                    </div>
                </div>
            `;
        }

        bodyEl.innerHTML = `
      <div class="profile-avatar-large">
        ${currentUserData.name ? currentUserData.name.charAt(0).toUpperCase() : 'A'}
      </div>
      <div class="profile-info-grid">
        <div class="profile-info-item">
          <div class="profile-info-label">Name${mainAdminBadge}</div>
          <div class="profile-info-value">${currentUserData.name || 'N/A'}</div>
        </div>
        <div class="profile-info-item">
          <div class="profile-info-label">Email</div>
          <div class="profile-info-value">${currentUserData.email || 'N/A'}</div>
        </div>
        <div class="profile-info-item">
          <div class="profile-info-label">Mobile</div>
          <div class="profile-info-value">${currentUserData.mobile || 'N/A'}</div>
        </div>
        <div class="profile-info-item">
          <div class="profile-info-label">Account Created</div>
          <div class="profile-info-value">${currentUserData.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString() : 'N/A'}</div>
        </div>
        ${currentUserData.lastLogin ? `
        <div class="profile-info-item">
          <div class="profile-info-label">Last Login</div>
          <div class="profile-info-value">${new Date(currentUserData.lastLogin).toLocaleString()}</div>
        </div>
        ` : ''}
      </div>
      ${mainAdminControls}
      ${!isMainAdmin ? '<div style="margin-top:16px;padding:12px;background:rgba(108,99,255,0.1);border:1px solid rgba(108,99,255,0.3);border-radius:8px;font-size:12px;color:var(--muted);text-align:center;">To edit your profile information, please contact the main administrator.</div>' : ''}
    `;

        if (isMainAdmin) {
            const btnChangeEmail = document.getElementById('btnChangeEmail');
            const btnChangePassword = document.getElementById('btnChangePassword');
            if (btnChangeEmail) btnChangeEmail.onclick = handleChangeEmail;
            if (btnChangePassword) btnChangePassword.onclick = handleChangePassword;
        }
    }

    // Close Profile Modal
    function closeProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Handle Logout
    async function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        }
    }

    // --- Main Admin Security Functions ---
    async function handleChangeEmail() {
        const newEmail = prompt("Enter your new email address:");
        if (!newEmail) return;

        const password = prompt("Please enter your current password to confirm:");
        if (!password) return;

        try {
            // Re-authenticate first
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(credential);

            // Update email in Auth
            await currentUser.updateEmail(newEmail);

            // Update email in Database
            await database.ref('admin_users/' + currentUser.uid).update({
                email: newEmail,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });

            alert('Email updated successfully!');
            updateProfileModalContent();
        } catch (error) {
            console.error(error);
            alert('Error updating email: ' + error.message);
        }
    }

    async function handleChangePassword() {
        const newPassword = prompt("Enter your new password (min 6 chars):");
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const password = prompt("Please enter your CURRENT password to confirm:");
        if (!password) return;

        try {
            // Re-authenticate first
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(credential);

            // Update password
            await currentUser.updatePassword(newPassword);

            alert('Password updated successfully! You may need to login again.');
        } catch (error) {
            console.error(error);
            alert('Error updating password: ' + error.message);
        }
    }


    // Initialize User Management
    function initializeUserManagement() {
        const btnAddUser = document.getElementById('btnAddUser');
        if (btnAddUser) {
            // Remove old listeners to prevent duplicates if any
            const newBtn = btnAddUser.cloneNode(true);
            btnAddUser.parentNode.replaceChild(newBtn, btnAddUser);
            newBtn.addEventListener('click', handleAddUser);
        }

        // Load users list
        loadUsersList();
    }

    // Handle Add User
    async function handleAddUser() {
        const name = document.getElementById('newUserName').value.trim();
        const mobile = document.getElementById('newUserMobile').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const password = document.getElementById('newUserPassword').value;
        const statusEl = document.getElementById('addUserStatus');
        const btnAddUser = document.getElementById('btnAddUser');

        if (!name || !mobile || !email || !password) {
            showStatus(statusEl, 'Please fill in all fields.', 'error');
            return;
        }

        if (password.length < 8) {
            showStatus(statusEl, 'Password must be at least 8 characters long.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus(statusEl, 'Please enter a valid email address.', 'error');
            return;
        }

        btnAddUser.disabled = true;
        btnAddUser.textContent = 'Adding User...';
        showStatus(statusEl, 'Creating user account...', 'info');

        try {
            // Create new user with Firebase Auth
            // Note: This signs in the NEW user automatically, so we need to sign them out and sign the admin back in. 
            // BUT we can't easily get the admin password back. 
            // Creating a secondary app instance is the workaround for client-side admin.

            const secondaryApp = firebase.initializeApp(window.firebaseConfig, "Secondary");
            const secondaryAuth = secondaryApp.auth();

            const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            const newUser = userCredential.user;

            // Clean up secondary app
            await secondaryAuth.signOut();
            await secondaryApp.delete();

            // Save user data to database using PRIMARY app
            await database.ref('admin_users/' + newUser.uid).set({
                name: name,
                email: email,
                mobile: mobile,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: currentUser.uid,
                blocked: false,
                isMainAdmin: false
            });

            showStatus(statusEl, 'User created successfully!', 'success');

            // Clear inputs
            document.getElementById('newUserName').value = '';
            document.getElementById('newUserMobile').value = '';
            document.getElementById('newUserEmail').value = '';
            document.getElementById('newUserPassword').value = '';

            loadUsersList();
            btnAddUser.disabled = false;
            btnAddUser.textContent = 'Add User';

            setTimeout(() => {
                showStatus(statusEl, '', '');
            }, 3000);

        } catch (error) {
            console.error('Error adding user:', error);

            let errorMsg = 'Error creating user account.';
            if (error.code === 'auth/email-already-in-use') errorMsg = 'This email is already registered.';

            showStatus(statusEl, errorMsg, 'error');
            btnAddUser.disabled = false;
            btnAddUser.textContent = 'Add User';

            // If the workaround failed (e.g. secondary app error), we might need to rely on the old method
            // but the old method signs out the admin. 
            // If secondary app approach fails, we just alert user.
        }
    }

    // Edit User Modal
    function initializeEditUserModal() {
        if (document.getElementById('editUserModal')) return;

        const modal = document.createElement('div');
        modal.id = 'editUserModal';
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal-content" style="max-width: 400px;">
                <div class="profile-modal-header">
                    <h2 style="margin:0;font-size:18px;font-weight:600;color:var(--text);">Edit User Info</h2>
                    <button class="profile-modal-close" id="editUserModalClose">×</button>
                </div>
                <div class="profile-modal-body">
                    <div style="display:grid;gap:16px;">
                        <input type="hidden" id="editUserUid">
                        <label class="field">
                            <span>Name</span>
                            <input id="editUserName" type="text" style="padding:12px;border-radius:12px;border:1px solid var(--outline);background:var(--dropdown-background);color:var(--text);width:100%;">
                        </label>
                        <label class="field">
                            <span>Mobile</span>
                            <input id="editUserMobile" type="tel" style="padding:12px;border-radius:12px;border:1px solid var(--outline);background:var(--dropdown-background);color:var(--text);width:100%;">
                        </label>
                    </div>
                </div>
                <div class="profile-modal-footer">
                    <button class="ghost-btn" id="editUserCancelBtn">Cancel</button>
                    <button class="primary-btn" id="editUserSaveBtn">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.profile-modal-overlay').addEventListener('click', closeEditUserModal);
        modal.querySelector('#editUserModalClose').addEventListener('click', closeEditUserModal);
        modal.querySelector('#editUserCancelBtn').addEventListener('click', closeEditUserModal);
        modal.querySelector('#editUserSaveBtn').addEventListener('click', saveEditedUser);
    }

    function openEditUserModal(uid, name, mobile) {
        const modal = document.getElementById('editUserModal');
        if (!modal) return;

        document.getElementById('editUserUid').value = uid;
        document.getElementById('editUserName').value = name;
        document.getElementById('editUserMobile').value = mobile;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function closeEditUserModal() {
        const modal = document.getElementById('editUserModal');
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    async function saveEditedUser() {
        const uid = document.getElementById('editUserUid').value;
        const name = document.getElementById('editUserName').value.trim();
        const mobile = document.getElementById('editUserMobile').value.trim();

        if (!name || !mobile) {
            alert('Name and Mobile are required.');
            return;
        }

        try {
            await database.ref('admin_users/' + uid).update({
                name: name,
                mobile: mobile,
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                updatedBy: currentUser.uid
            });
            alert('User info updated!');
            closeEditUserModal();
            loadUsersList();
        } catch (error) {
            console.error(error);
            alert('Failed to update user.');
        }
    }


    // Load Users List
    async function loadUsersList() {
        const usersListEl = document.getElementById('usersList');
        const statusEl = document.getElementById('usersListStatus');

        if (!usersListEl) return;

        showStatus(statusEl, 'Loading users...', 'info');

        try {
            const snapshot = await database.ref('admin_users').once('value');
            const users = snapshot.val();

            if (!users) {
                usersListEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;">No users found.</div>';
                showStatus(statusEl, '', '');
                return;
            }

            const usersArray = Object.keys(users).map(uid => ({
                uid,
                ...users[uid]
            }));

            // Filter users
            const mainAdmins = usersArray.filter(u => u.email === MAIN_ADMIN_EMAIL || u.isMainAdmin);
            const subAdmins = usersArray.filter(u => !(u.email === MAIN_ADMIN_EMAIL || u.isMainAdmin));

            // Sort sub-admins by creation date
            subAdmins.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            let html = '';

            // Render Main Admins Section
            if (mainAdmins.length > 0) {
                html += `
                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 14px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.5px;">Main Administrator</h3>
                        <div style="display: grid; gap: 12px;">
                            ${mainAdmins.map(user => renderUserCard(user)).join('')}
                        </div>
                    </div>
                `;
            }

            // Render Other Admins Section
            if (subAdmins.length > 0) {
                html += `
                    <div>
                        <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.5px;">User Administrators</h3>
                        <div style="display: grid; gap: 12px;">
                            ${subAdmins.map(user => renderUserCard(user)).join('')}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div>
                         <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.5px;">User Administrators</h3>
                         <div style="padding: 16px; background: rgba(158,140,255,0.05); border-radius: 8px; color: var(--muted); text-align: center; font-size: 13px;">No other admins found.</div>
                    </div>
                 `;
            }

            usersListEl.innerHTML = html;

            // Add Listeners
            usersArray.forEach(user => {
                addUserCardListeners(user.uid, user.email === MAIN_ADMIN_EMAIL || user.isMainAdmin, user);
            });

            showStatus(statusEl, `Loaded ${usersArray.length} user(s).`, 'success');

            setTimeout(() => {
                showStatus(statusEl, '', '');
            }, 3000);

        } catch (error) {
            console.error('Error loading users:', error);
            showStatus(statusEl, 'Error loading users list.', 'error');
        }
    }

    // Render User Card
    function renderUserCard(user) {
        const isTargetMain = user.email === MAIN_ADMIN_EMAIL || user.isMainAdmin === true;
        const blockedClass = user.blocked ? 'opacity:0.6;' : '';
        const blockedBadge = user.blocked ? '<span style="background:rgba(220,53,69,0.2);color:#dc3545;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;">BLOCKED</span>' : '';
        const mainBadge = isTargetMain ? '<span style="background:rgba(108,99,255,0.2);color:var(--primary);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;">MAIN ADMIN</span>' : '';

        return `
      <div class="card" style="padding:16px;${blockedClass}">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="font-size:16px;font-weight:600;color:var(--text);">${user.name || 'N/A'}</div>
              ${mainBadge}
              ${blockedBadge}
            </div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">
              📧 ${user.email || 'N/A'}
            </div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">
              📱 ${user.mobile || 'N/A'}
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:8px;">
              Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            ${user.lastLogin ? `<div style="font-size:11px;color:var(--muted);">Last Login: ${new Date(user.lastLogin).toLocaleString()}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${!isTargetMain ? `
              <button class="ghost-btn small" data-action="edit" data-uid="${user.uid}" style="padding:8px 12px;font-size:12px;">
                ✏️ Edit
              </button>
              <button class="ghost-btn small" data-action="${user.blocked ? 'unblock' : 'block'}" data-uid="${user.uid}" style="padding:8px 12px;font-size:12px;${user.blocked ? 'background:rgba(40,167,69,0.1);color:#28a745;' : 'background:rgba(255,193,7,0.1);color:#ffc107;'}">
                ${user.blocked ? '✓ Unblock' : '🚫 Block'}
              </button>
              <button class="ghost-btn small" data-action="delete" data-uid="${user.uid}" style="padding:8px 12px;font-size:12px;background:rgba(220,53,69,0.1);color:#dc3545;">
                🗑️ Delete
              </button>
            ` : '<div style="font-size:12px;color:var(--muted);padding:8px;">Cannot modify main admin</div>'}
          </div>
        </div>
      </div>
    `;
    }

    // Add User Card Listeners
    function addUserCardListeners(uid, isTargetMain, userData) {
        if (isTargetMain) return;

        const editBtn = document.querySelector(`button[data-action="edit"][data-uid="${uid}"]`);
        if (editBtn) {
            editBtn.addEventListener('click', () => openEditUserModal(uid, userData.name, userData.mobile));
        }

        const blockBtn = document.querySelector(`button[data-action="block"][data-uid="${uid}"], button[data-action="unblock"][data-uid="${uid}"]`);
        if (blockBtn) {
            const action = blockBtn.getAttribute('data-action');
            blockBtn.addEventListener('click', () => handleToggleBlock(uid, action === 'block'));
        }

        const deleteBtn = document.querySelector(`button[data-action="delete"][data-uid="${uid}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => handleDeleteUser(uid));
        }
    }

    // Handle Toggle Block
    async function handleToggleBlock(uid, shouldBlock) {
        const action = shouldBlock ? 'block' : 'unblock';

        if (!confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            await database.ref('admin_users/' + uid).update({
                blocked: shouldBlock,
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                updatedBy: currentUser.uid
            });

            alert(`User ${action}ed successfully!`);
            loadUsersList();

        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            alert(`Error ${action}ing user. Please try again.`);
        }
    }

    // Handle Delete User
    async function handleDeleteUser(uid) {
        if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone!')) {
            return;
        }

        if (!confirm('This will permanently delete the user from database. Are you absolutely sure?')) {
            return;
        }

        try {
            await database.ref('admin_users/' + uid).remove();
            alert('User removed from database successfully! Note: The user still exists in Firebase Authentication and should be deleted from Firebase Console manually if needed.');
            loadUsersList();

        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please try again.');
        }
    }

    // Show Status Message
    function showStatus(element, message, type) {
        if (!element) return;

        element.textContent = message;
        element.className = 'soft';

        if (type === 'error') {
            element.style.color = '#dc3545';
            element.style.background = 'rgba(220, 53, 69, 0.1)';
            element.style.border = '1px solid rgba(220, 53, 69, 0.3)';
        } else if (type === 'success') {
            element.style.color = '#28a745';
            element.style.background = 'rgba(40, 167, 69, 0.1)';
            element.style.border = '1px solid rgba(40, 167, 69, 0.3)';
        } else if (type === 'info') {
            element.style.color = 'var(--accent)';
            element.style.background = 'rgba(108, 99, 255, 0.1)';
            element.style.border = '1px solid rgba(108, 99, 255, 0.3)';
        } else {
            element.style.color = '';
            element.style.background = '';
            element.style.border = '';
        }

        if (message) {
            element.style.display = 'block';
            element.style.padding = '12px';
            element.style.borderRadius = '8px';
            element.style.marginTop = '8px';
        } else {
            element.style.display = 'none';
        }
    }

})();
