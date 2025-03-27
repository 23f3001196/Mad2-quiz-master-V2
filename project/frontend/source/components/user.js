export default {
    template: `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" >User Dashboard</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link" href="/user">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/scores">Score</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="user_search">Search</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="user_summary">Summary</a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="row border">
            <div class="col-12 border">
                <h2>Available Quizzes</h2>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Quiz Title</th>
                            <th scope="col">Chapter ID</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="quiz in quizzes" :key="quiz.id">
                            <td>{{ quiz.id }}</td>
                            <td>{{ quiz.title }}</td>
                            <td>{{ quiz.chapter_id }}</td>
                            <td>
                                <button @click="attemptQuiz(quiz)" class="btn btn-primary btn-sm">Attempt</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Attempt Quiz Modal -->
        <modal v-if="showAttemptQuizModal" @close="showAttemptQuizModal = false">
            <template v-slot:header>
                <h3>Attempt Quiz: {{ currentQuiz.title }}</h3>
            </template>
            <template v-slot:body>
                <div v-for="question in currentQuiz.questions" :key="question.id">
                    <p>{{ question.question_statement }}</p>
                    <div>
                        <label>
                            <input type="radio" :value="question.option1" v-model="selectedAnswers[question.id]" /> {{ question.option1 }}
                        </label>
                        <label>
                            <input type="radio" :value="question.option2" v-model="selectedAnswers[question.id]" /> {{ question.option2 }}
                        </label>
                        <label>
                            <input type="radio" :value="question.option3" v-model="selectedAnswers[question.id]" /> {{ question.option3 }}
                        </label>
                        <label>
                            <input type="radio" :value="question.option4" v-model="selectedAnswers[question.id]" /> {{ question.option4 }}
                        </label>
                    </div>
                </div>
                <p>Time Remaining: {{ timeRemaining }} seconds</p>
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="submitQuiz">Submit</button>
                <button class="btn btn-secondary" @click="showAttemptQuizModal = false">Close</button>
            </template>
        </modal>
    </div>
    `,
    data() {
        return {
            userData: {},
            quizzes: [],
            showAttemptQuizModal: false,
            currentQuiz: {},
            selectedAnswers: {},
            timeRemaining: 0,
            timer: null
        };
    },
    mounted() {
        this.loadUser ();
        this.loadQuizzes();
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
        loadQuizzes() {
            fetch('/api/quiz', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.quizzes = data; // Assuming the API returns an array of quizzes
            })
            .catch(error => console.error('Error loading quizzes:', error));
        },
        attemptQuiz(quiz) {
            this.currentQuiz = quiz;
            this.selectedAnswers = {};
            this.timeRemaining = 300; // Set timer for 5 minutes (300 seconds)
            this.showAttemptQuizModal = true;
            this.startTimer();
            this.loadQuizQuestions(quiz.id);
        },
        loadQuizQuestions(quizId) {
            fetch(`/api/quiz/${quizId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data => {
                this.currentQuiz.questions = data.questions; // Assuming the API returns questions
            })
            .catch(error => console.error('Error loading quiz questions:', error));
        },
        startTimer() {
            this.timer = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timer);
                    this.submitQuiz(); // Automatically submit when time is up
                }
            }, 1000);
        },
        submitQuiz() {
            clearInterval(this.timer);
            const answers = {
                quiz_id: this.currentQuiz.id,
                user_id: this.userData.id,
                answers: this.selectedAnswers
            };
            fetch('/submit_quiz', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(answers)
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response, e.g., show score or success message
                console.log('Quiz submitted successfully:', data);
                this.showAttemptQuizModal = false; // Close modal
            })
            .catch(error => console.error('Error submitting quiz:', error));
        }
    }
}