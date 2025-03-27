import Modal from './modal.js';

export default {
    template: `
    <div>
        <h2 class="my-2">Welcome, {{ userData.username }}!</h2>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand">Quiz Management</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item active">
                        <a class="nav-link">Home </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" >quiz <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="admin_search">Search</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="admin_summary">Summary</a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="row border">
            <div class="text-end my-2">
                <button @click="showAddQuizModal " class="btn btn-primary">Add New Quiz</button>
            </div>
        </div>
        <div v-if="quizzes.length === 0">
            <p>No quiz available. Please add a new quiz.</p>
        </div>
        <div class="row border" v-if="quizzes.length > 0"> 
            <div class="col-12 border" style="height: 750px; overflow-y: scroll"> 
                <h2>Quizzes and Questions</h2> 
                <table class="table table-striped"> 
                   <thead>
                   <h2>Quizzes</h2>
                   </thead>
                     
                    <tbody> 
                        
                        <tr v-for="quiz in quizzes" :key="quiz.id">
                            <table class="table table-striped">
                                <thead> 
                                    <tr> 
                                    <th scope="col">ID</th> 
                                    <th scope="col">Quiz Name</th> 
                                    <th scope="col">Date of quiz</th>
                                    <th scope="col">Time (in sec)</th> 
                                    <th scope="col">Remarks</th>
                                    <th scope="col">Actions</th>
                                    </tr> 
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <button @click="showQuestionsinQuiz(quiz)"class="btn btn-primary">{{ quiz.id }}</button>
                                        </td> 
                                        <td>{{ quiz.title }}</td> 
                                        <td>{{ quiz.date_of_quiz }}</td> 
                                        <td>{{ quiz.time_duration }}</td> 
                                        <td>{{ quiz.remarks }}</td> 
                                        <td> 
                                            <button @click="editQuiz(quiz)" class="btn btn-info btn-sm">Edit</button> 
                                            <button @click="deleteQuiz(quiz.id)" class="btn btn-danger btn-sm">Delete</button> 
                                        </td> 
                                    </tr>
                                    <tr v-show="quiz.showQuestions"> 
                                        <td colspan="4"> 
                                            <h4>Questions for {{ quiz.title }}</h4> 
                                            <button @click="showAddQuestionModal(quiz)" class="btn btn-secondary">Add New Question</button>
                                             
                                            <table class="table table-striped"> 
                                                <thead> 
                                                    <tr> 
                                                        <th scope="col">Question ID</th> 
                                                        <th scope="col">Question Statement</th> 
                                                        <th scope="col">Option 1</th>
                                                        <th scope="col">Option 2</th>
                                                        <th scope="col">Option 3</th>
                                                        <th scope="col">Option 4</th>
                                                        <th scope="col">Correct answer</th>
                                                        <th scope="col">Marks</th>
                                                        <th scope="col">Actions</th> 
                                                    </tr> 
                                                </thead> 
                                                <tbody> 
                                                    <tr v-for="question in quiz.questions" :key="question.id"> 
                                                        <td>{{ question.id }}</td> 
                                                        <td>{{ question.question_statement }}</td> 
                                                        <td>{{ question.option1 }}</td> 
                                                        <td>{{ question.option2 }}</td> 
                                                        <td>{{ question.option3 }}</td> 
                                                        <td>{{ question.option4}}</td>
                                                        <td>{{ question.correct_answer }}</td> 
                                                        <td>{{ question.marks }}</td> 
                                                        <td> 
                                                            <button @click="editQuestion(question)" class="btn btn-warning btn-sm">Edit</button> 
                                                            <button @click="deleteQuestion(question.id)" class="btn btn-danger btn-sm">Delete</button> 
                                                        </td> 
                                                    </tr> 
                                                </tbody> 
                                            </table> 
                                        </td> 
                                    </tr>
                                </tbody>
                            </table>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Quiz Modal -->
        <Modal v-show="vshowAddQuizModal">
            <template v-slot:header>
                <h3>Add Quiz</h3>
            </template>
            <template v-slot:body>
                <input v-model="newQuiz.title" placeholder="Quiz Name" />
                <input type="date" v-model="newQuiz.date_of_quiz" placeholder="Date of quiz" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="addQuiz">Add</button>
                <button class="btn btn-secondary" @click="vshowAddQuizModal = false">Close</button>
            </template>
        </Modal>

        <!-- Edit Quiz Modal -->
        <Modal v-show="showEditQuizModal">
            <template v-slot:header>
                <h3>Edit Quiz</h3>
            </template>
            <template v-slot:body>
                <input v-model="editQuizData.title" placeholder="Quiz Name" />
                <input type="date" v-model="editQuizData.date_of_quiz" placeholder="Date of quiz" />
                <input v-model="editQuizData.time_duration" placeholder="Time(in secs)" />
                <input v-model="editQuizData.remarks" placeholder="Remarks" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="updateQuiz">Update</button>
                <button class="btn btn-secondary" @click="showEditQuizModal = false">Close</button>
            </template>
        </Modal>

        <!-- Add Question Modal -->
        <Modal v-show="vshowAddQuestionModal">
            <template v-slot:header>
                <h3>Add Question</h3>
            </template>
            <template v-slot:body>
                <input v-model="newQuestion.question_statement" placeholder="Question Statement" />
                <input v-model="newQuestion.option1" placeholder="Option 1" />
                <input v-model="newQuestion.option2" placeholder="Option 2" />
                <input v-model="newQuestion.option3" placeholder="Option 3" />
                <input v-model="newQuestion.option4" placeholder="Option 4" />
                <input v-model="newQuestion.correct_answer" placeholder="Correct answer" />
                <input v-model="newQuestion.marks" placeholder="Marks" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="addQuestion">Add</button>
                <button class="btn btn-secondary" @click="vshowAddQuestionModal = false">Close</button>
            </template>
        </Modal>

        <!-- Edit Question Modal -->
        <Modal v-show="showEditQuestionModal">
            <template v-slot:header>
                <h3>Edit Question</h3>
            </template>
            <template v-slot:body>
                <input v-model="editQuestionData.question_statement" placeholder="Question Statement" />
                <input v-model="editQuestionData.option1" placeholder="Option 1" />
                <input v-model="editQuestionData.option2" placeholder="Option 2" />
                <input v-model="editQuestionData.option3" placeholder="Option 3" />
                <input v-model="editQuestionData.option4" placeholder="Option 4" />
                <input v-model="editQuestionData.correct_answer" placeholder="Correct answer" />
                <input v-model="editQuestionData.marks" placeholder="Marks" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="updateQuestion">Update</button>
                <button class="btn btn-secondary" @click="showEditQuestionModal = false">Close</button>
            </template>
        </Modal>
    </div>
    `,
    data() {
        return {
            userData: {},
            quizzes: [],
            newQuiz: { title: '', date_of_quiz: '', time_duration: '', remarks: '',chapter_id:null },
            editQuizData: { id: null, title: '', date_of_quiz: '', time_duration: '', remarks: '' },
            newQuestion: { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_answer: '', marks: '', quiz_id: null },
            editQuestionData: { id: null, question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_answer: '', marks: '' },
            vshowAddQuizModal: false,
            showEditQuizModal: false,
            vshowAddQuestionModal: false,
            showEditQuestionModal: false,
        }
    },
    components: {
        Modal,

    },
    mounted() {
        this.loadUser ();
        const chapter_id = this.$route.params.chapter_id;
        this.loadQuizzes(chapter_id);
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
        loadQuizzes(chapter_id) {
            fetch(`/api/q?chapter_id=${chapter_id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    console.log('No quizzes found.');
                    this.quizzes = [];
                    return ;
                }
            })
            .then(data => {
                this.quizzes = data.map(quiz => ({
                    ...quiz,
                    questions: [], // Initialize questions array
                    showQuestions: false // Initialize showQuestions property
                }));
            })
            .catch(error => console.error('Error loading quizzes:', error));
        },
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        loadQuestions(quiz) {
            fetch(`/api/question?quiz_id=${quiz.id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    console.log('No questions found for this quiz.');
                    return ;
                }
            })
            .then(data => {
                this.$set(quiz, 'questions', data); // Set questions for the quiz
            })
            .catch(error => console.error('Error loading questions:', error));
        },
        showAddQuizModal() {
            this.newQuiz.chapter_id = this.chapter_id; // Set the chapter_id for the new quiz
            this.vshowAddQuizModal = true; // Open the add quiz modal
        },
        showQuestionsinQuiz(quiz) {
            quiz.showQuestions = !quiz.showQuestions; // Toggle visibility
            if (quiz.showQuestions && quiz.questions.length === 0) {
                this.loadQuestions(quiz); // Load questions if not already loaded
            }
        },
        addQuiz() {
            this.newQuiz.chapter_id = this.$route.params.chapter_id; // Set the chapter_id for the new quiz
            fetch('/api/quiz', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.newQuiz)
            })
            .then(response => response.json())
            .then(data => {
                this.quizzes.push(data);
                this.vshowAddQuizModal = false
                this.newQuiz = { title: '', date_of_quiz: '', time_duration: '', remarks: '', chapter_id: null }; // Reset form
                
                this.loadQuizzes(this.$route.params.chapter_id); // Reload quizzes
            })
            .catch(error => console.error('Error adding quiz:', error));
        },
        
        editQuiz(quiz) {
            this.editQuizData = { ...quiz }; // Copy quiz data for editing
            date_of_quiz: this.formatDate(quiz.date_of_quiz)
            this.showEditQuizModal = true; // Open edit modal
        },
        
        updateQuiz() {
            fetch(`/api/quiz/${this.editQuizData.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.editQuizData)
            })
            .then(response => response.json())
            .then(data => {
                const index = this.quizzes.findIndex(quiz => quiz.id === data.id);
                this.quizzes.splice(index, 1, data); // Update the quiz in the list
                this.showEditQuizModal = false; // Close modal
                this.loadQuizzes(this.$route.params.chapter_id); // Reload quizzes
            })
            .catch(error => console.error('Error updating quiz:', error));
        },
        deleteQuiz(id) {
            fetch(`/api/quiz/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(() => {
                this.quizzes = this.quizzes.filter(quiz => quiz.id !== id); // Remove quiz from the list
            })
            .catch(error => console.error('Error deleting quiz:', error));
        },
        showAddQuestionModal(quiz) {
            this.newQuestion.quiz_id = quiz.id; // Set the quiz ID for the new question
            this.vshowAddQuestionModal = true; // Open the add question modal
        },
        addQuestion() {
            fetch('/api/question', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ ...this.newQuestion })
            })
            .then(response => response.json())
            .then(data => {
                const quiz = this.quizzes.find(q => q.id === this.newQuestion.quiz_id);
                if (quiz) {
                    quiz.questions.push(data); // Add the new question to the quiz's questions
                }
                this.newQuestion = { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_answer: '', marks: '', quiz_id: null }; // Reset form
                this.vshowAddQuestionModal = false; // Close modal
            })
            .catch(error => console.error('Error adding question:', error));
        },
        editQuestion(question) {
            this.editQuestionData = { ...question }; // Copy question data for editing
            this.showEditQuestionModal = true; // Open edit modal
        },
        updateQuestion() {
            fetch(`/api/question/${this.editQuestionData.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.editQuestionData)
            })
            .then(response => response.json())
            .then(data => {
                const quiz = this.quizzes.find(q => q.questions.some(q => q.id === data.id));
                if (quiz) {
                    const index = quiz.questions.findIndex(q => q.id === data.id);
                    quiz.questions.splice(index, 1, data); // Update the question in the list
                }
                this.showEditQuestionModal = false; // Close modal
            })
            .catch(error => console.error('Error updating question:', error));
        },
        deleteQuestion(id) {
            fetch(`/api/question/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(() => {
                // Find the quiz that contains the question
                const quiz = this.quizzes.find(q => q.questions.some(q => q.id === id));
                if (quiz) {
                    // Remove the question from the quiz's questions array
                    quiz.questions = quiz.questions.filter(question => question.id !== id);
                }
            })
            .catch(error => console.error('Error deleting question:', error));
        }
    }
}