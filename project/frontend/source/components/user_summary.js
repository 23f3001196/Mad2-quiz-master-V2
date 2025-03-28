export default {
    template: `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand">User  Dashboard</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link">Home</a>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showScores">Score</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showSearch">Search</button>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link">Summary<span class="sr-only">(current)</span></a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="summary-images">
            <h3>Summary Charts</h3>
            <img src="../source/user_performance.png" alt="User Performance" class="img-fluid"  />
            <img src="../source/user_quiz.png" alt="Quiz Attempts" class="img-fluid"  />
        </div>
    </div>
    `,
    data() {
        return {
            userData: {},          
        };
    },
    mounted() {
        this.loadUser();  // Load user data on component mount
        this.UserSummary();  // Load user summary after user data is available
    },
    methods: {
        loadUser() {
            fetch('/home', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.userData = data;  // Store the user data in the component's state
                this.UserSummary();     // Now that userData is loaded, fetch the user summary
            })
            .catch(error => console.error('Error loading user:', error));
        },
        
        async UserSummary() {
            try {
                // Fetch the user summary with the user ID in the URL or query parameter
                const response = await fetch(`/user/summary/${this.userData.id}`, {
                    method: 'GET',  // Use GET instead of POST for fetching data
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth_token')
                    }
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
            } catch (error) {
                console.error('Error fetching user summary:', error);
            }
        },
        
        showScores() {
            this.$router.push('/scores'); // Navigate to the scores page
        },
        
        showSearch() {
            this.$router.push('/user/search'); // Navigate to the search page
        }
    }
}