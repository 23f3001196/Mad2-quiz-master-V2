export default{
    template: `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand">Admin Dashboard</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" >Quiz</a>
                    </li>
                    <li class="nav-item">
                    <button class="nav-link btn btn-link" @click="showSearch">Search</button>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="admin_summary">Summary<span class="sr-only">(current)</span></a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="summary-images">
            <h3>Summary Charts</h3>
            
            <img src="../source/admin_top_quizzes.png" alt="Top Quizzes by Average Score" class="img-fluid" />
            <img src="../source/admin_quiz_attempts.png" alt="Quiz Attempts Distribution" class="img-fluid" />
        </div>
    </div>
    `,
    data() {
        return {
            userData: {} // Initialize userData or fetch it as needed
        };
    },
    mounted() {
        this.loadUser();
        this.loadSummary();
    },
    methods:{
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
                this.userData = data;
            })
            .catch(error => console.error('Error loading user:', error));
        },
        loadSummary() {
            fetch('/admin/summary', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle the summary data if needed
                console.log('Summary data:', data);
            })
            .catch(error => console.error('Error loading summary:', error));

        },
        showSearch() {
            this.router.push('/admin/search')
    
        }
        
    }
}