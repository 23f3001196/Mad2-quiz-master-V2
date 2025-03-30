export default{
    template:
    `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" >User Search</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <button class="nav-link btn btn-link" @click="showDash">Home</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showScores">Score</button>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" >Search<span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link btn btn-link" @click="showSummary">Summary</button>
                    </li>
                </ul>
            </div>
        </nav>
        <div>
            <h3>User Search</h3>
            <input type="text" v-model="searchText" placeholder="Search..." />
            <select v-model="searchBy">
                <option value="subject">Subject</option>
                <option value="quiz">Quiz</option>
            </select>
            <button @click="performSearch">Search</button>
        </div>

        <div v-if="results.length === 0">No results found</div>
        <div v-if="results.length > 0">
            <h4>Search Results</h4>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th v-if="searchBy === 'subject'">Subject Name</th>
                        
                        <th v-if="searchBy === 'quiz'">Quiz Title</th>
                        <th v-if="searchBy === 'quiz'">Chapter Name</th> <!-- Corrected header -->
                        <th v-if="searchBy === 'quiz'">Date of quiz</th> 
                        <th v-if="searchBy === 'quiz'">Time Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="result in results" :key="result.id">
                        <td v-if="searchBy === 'subject'">{{ result.name }}</td>
                        
                        <td v-if="searchBy === 'quiz'">{{ result.title }}</td>
                        <td v-if="searchBy === 'quiz'">{{ result.chapter_name }}</td> <!-- Use chapter_name -->
                        <td v-if="searchBy === 'quiz'">{{ result.date_of_quiz }}</td>
                        <td v-if="searchBy === 'quiz'">{{ result.time_duration }}</td>
                    </tr>
                </tbody>
            </table>
            <div>No more results</div>
        </div>


    </div>
    `,
    data() {
        return {
            userData: {},
            searchText: '',
            searchBy: 'users', // Default search type
            results: []
        };
    },
    mounted() {
        this.loadUser ();
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
            })
            .catch(error => console.error('Error loading user:', error));
        },
        async performSearch() {
            try {
                const response = await fetch('/user/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth_token') // Include your auth token
                    },
                    body: JSON.stringify({
                        Search_by: this.searchBy,
                        text: this.searchText
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                this.results = data.results; // Store the results
            } catch (error) {
                console.error('Error during search:', error);
            }
        },
        showScores(){
            this.$router.push('/score')
        },
        showDash(){
            this.$router.push('/user')
        },
        showSummary(){
            this.$router.push(`/user/summary/${this.userData.id}`)
        }
    }
}
    