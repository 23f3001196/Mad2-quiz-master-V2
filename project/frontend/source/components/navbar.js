export default {
    template: `
    <div class="row border">
        <div class="col-10 fs-2 border">
            Quiz Master
        </div>
        <div class="col-2 border">
            <div class="mt-1">
                <div v-if="!isLoggedIn">
                    <router-link class="btn btn-primary my-2" to="/userlogin">Login</router-link>
                    <router-link class="btn btn-primary my-2" to="/register">Register</router-link>
                </div>
                <div v-if="isLoggedIn">
                    <button class="btn btn-primary my-2" @click="logout">Logout</button>
                </div>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            isLoggedIn: false, // Set this based on your authentication logic
            username: '',
        }
    },
    watch: {
        '$route': function() { // Watch route changes
            this.isLoggedIn = !!localStorage.getItem("auth_token");
        }
    },
    created() {
        // Check if the user is logged in based on the presence of an auth token
        this.isLoggedIn = !!localStorage.getItem('auth_token');
    },
    methods: {
        logout() {
            // Call the backend logout endpoint
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // Include the token if needed
                }
            })
            .then(response => {
                if (response.ok) {
                    localStorage.removeItem('auth_token'); // Remove the auth token
                    this.isLoggedIn = false; // Update the state
                    this.$router.push('/'); // Redirect to home or login page
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
}