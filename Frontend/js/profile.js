document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuthState();
    
    try {
        // Show loading state
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner text-primary"></div>
                <p class="mt-2">Loading profile...</p>
            </div>
        `;
        
        // Fetch current user
        const user = await api.get('/Auth/me');
        
        // Render profile
        renderProfile(user);
    } catch (error) {
        auth.showToast(error.message, 'danger');
        document.getElementById('main-content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load profile. Please try again later.
            </div>
        `;
    }
});

function renderProfile(user) {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-lg-4">
                <div class="card mb-4">
                    <div class="card-body text-center">
                        <img src="images/Profile_avatar_placeholder_large.png" 
                             alt="avatar" 
                             class="rounded-circle img-fluid" style="width: 150px;">
                        <h5 class="my-3">${user.firstName} ${user.lastName}</h5>
                        <p class="text-muted mb-1">Member since ${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-8">
                <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="mb-4">Profile Information</h4>
                        <form id="profile-form">
                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-control" id="first-name" value="${user.firstName}">
                                </div>
                                <div class="col-sm-6 mb-3">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-control" id="last-name" value="${user.lastName}">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" value="${user.email}" disabled>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" placeholder="Leave blank to keep current">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="confirm-password" placeholder="Leave blank to keep current">
                            </div>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Form submission
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password && password !== confirmPassword) {
            auth.showToast('Passwords do not match', 'danger');
            return;
        }
        
        try {
            // In a real app, you would call an API endpoint to update the profile
            // For this demo, we'll just show a success message
            auth.showToast('Profile updated successfully', 'success');
        } catch (error) {
            auth.showToast(error.message, 'danger');
        }
    });
}