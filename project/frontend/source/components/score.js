export default {
    template: `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand">Score Dashboard</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <button class="nav-link btn btn-link" @click="showDash">Home</button>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" >Score <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showSearch">Search</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showSummary">Summary</button>
                    </li>
                </ul>
            </div>
        </nav>
        <h3>User Scores</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Quiz ID</th>
                    <th scope="col">No of Questions</th>
                    <th scope="col">Date of Attempt</th>
                    <th scope="col">Score</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="score in userScores" :key="score.id">
                    <td>{{ score.quiz_id }}</td>
                    <td>{{ score.no_of_questions }}</td>
                    <td>{{ new Date(score.time_stamp_of_attempt).toLocaleDateString() }}</td>
                    <td>{{ score.total_score }} / {{ score.total_score_quiz }}</td>
                </tr>
                <tr v-if="userScores.length === 0">
                    <td colspan="4" class="text-center">No scores available.</td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            userData: {},
            userScores: [] // New property to hold user scores
        };
    },
    mounted() {
        this.loadUser ();
        this.loadUser_Scores(); // Fetch user scores when the component is mounted
    },
    methods: {
        loadUser () {
            fetch('/home', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.userData = data;
                this.loadUser_Scores(); // Call loadUser Scores after user data is loaded
            })
            .catch(error => console.error('Error loading user:', error));
        },
        loadUser_Scores() {
            if (!this.userData.id) {
                console.error('User  ID is undefined');
                return; // Prevent making a request if user ID is not available
            }

            fetch(`/score?user_id=${this.userData.id}`, { // Adjust the API endpoint as needed
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.userScores = data; // Assuming the API returns an array of scores
            })
            .catch(error => console.error('Error loading user scores:', error));
        },showDash() {
            this.$router.push('/user'); // Navigate to the scores page
        },
        
        showSearch() {
            this.$router.push('/user/search'); // Navigate to the scores page
        },
        
        showSummary() {
            this.$router.push(`/user/summary/${this.userData.id}`); // Navigate to the search page
        }
    }
}