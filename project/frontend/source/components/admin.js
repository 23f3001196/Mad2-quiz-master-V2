import Modal from './modal.js';

export default {
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
                        <a class="nav-link">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" >Quiz</a>
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
        <div class="row border">
            <div class="text-end">
                <button class="btn btn-secondary" @click="csvDownload"> Download csv report </button>
            </div>
        </div>
        <div class="row border">
            <div class="text-end my-2">
                <button @click="showAddSubjectModal = true" class="btn btn-primary">Add New Subject</button>
            </div>
        </div>
        <div v-if="subjects.length === 0">
            <p>No subjects available. Please add a new subject.</p>
        </div>
        <div class="row border" v-if="subjects.length > 0"> 
            <div class="col-12 border" style="height: 750px; overflow-y: scroll"> 
                <h2>Subjects and courses</h2> 
                <table class="table table-striped"> 
                   <thead>
                   <h2>Subjects</h2>
                   </thead>
                     
                    <tbody> 
                        
                        <tr v-for="subject in subjects" :key="subject.id">
                            <table class="table table-striped">
                                <thead> 
                                    <tr> 
                                    <th scope="col">ID</th> 
                                    <th scope="col">Subject Name</th> 
                                    <th scope="col">Description</th> 
                                    <th scope="col">Actions</th>
                                    </tr> 
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <button @click="showChaptersinSubjects(subject)"class="btn btn-primary">{{ subject.id }}</button>
                                        </td> 
                                        <td>{{ subject.name }}</td> 
                                        <td>{{ subject.description }}</td> 
                                        <td> 
                                            <button @click="editSubject(subject)" class="btn btn-info btn-sm">Edit</button> 
                                            <button @click="deleteSubject(subject.id)" class="btn btn-danger btn-sm">Delete</button> 
                                        </td> 
                                    </tr>
                                    <tr v-show="subject.showChapters"> 
                                        <td colspan="4"> 
                                            <h4>Chapters for {{ subject.name }}</h4> 
                                            <button @click="showAddChapterModal(subject)" class="btn btn-secondary">Add New Chapter</button>
                                             
                                            <table class="table table-striped"> 
                                                <thead> 
                                                    <tr> 
                                                        <th scope="col">Chapter ID</th> 
                                                        <th scope="col">Chapter Name</th> 
                                                        <th scope="col">Description</th> 
                                                        <th scope="col">Actions</th> 
                                                    </tr> 
                                                </thead> 
                                                <tbody> 
                                                    <tr v-for="chapter in subject.chapters" :key="chapter.id"> 
                                                        <td><button @click="gotoquiz(chapter.id)">{{ chapter.id }}</button></td> 
                                                        <td>{{ chapter.name }}</td> 
                                                        <td>{{ chapter.description }}</td> 
                                                        <td> 
                                                            <button @click="editChapter(chapter)" class="btn btn-warning btn-sm">Edit</button> 
                                                            <button @click="deleteChapter(chapter.id)" class="btn btn-danger btn-sm">Delete</button> 
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

        <!-- Add Subject Modal -->
        <Modal v-if="showAddSubjectModal">
            <template v-slot:header>
                <h3>Add Subject</h3>
            </template>
            <template v-slot:body>
                <input v-model="newSubject.name" placeholder="Subject Name" />
                <input v-model="newSubject.description" placeholder="Description" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="addSubject">Add</button>
                <button class="btn btn-secondary" @click="showAddSubjectModal = false">Close</button>
            </template>
        </Modal>

        <!-- Add Chapter Modal -->
        <Modal v-if="vshowAddChapterModal">
            <template v-slot:header>
                <h3>Add Chapter</h3>
            </template>
            <template v-slot:body>
                <input v-model="newChapter.name" placeholder="Chapter Name" />
                <input v-model="newChapter.description" placeholder="Description" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="addChapter">Add</button>
                <button class="btn btn-secondary" @click="vshowAddChapterModal = false">Close</button>
            </template>
        </Modal>

        <!-- Edit Subject Modal -->
        <Modal v-if="showEditSubjectModal">
            <template v-slot:header>
                <h3>Edit Subject</h3>
            </template>
            <template v-slot:body>
                <input v-model="editSubjectData.name" placeholder="Subject Name" />
                <input v-model="editSubjectData.description" placeholder="Description" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="updateSubject">Update</button>
                <button class="btn btn-secondary" @click="showEditSubjectModal = false">Close</button>
            </template>
        </Modal>

        <!-- Edit Chapter Modal -->
        <Modal v-if="showEditChapterModal">
            <template v-slot:header>
                <h3>Edit Chapter</h3>
            </template>
            <template v-slot:body>
                <input v-model="editChapterData.name" placeholder="Chapter Name" />
                <input v-model="editChapterData.description" placeholder="Description" />
            </template>
            <template v-slot:footer>
                <button class="btn btn-primary" @click="updateChapter">Update</button>
                <button class="btn btn-secondary" @click="showEditChapterModal = false">Close</button>
            </template>
        </Modal>
    </div>
    `,
    data() {
        return {
            userData: {},
            subjects: [],
            newSubject: { name: '', description: '' },
            editSubjectData: { id: null, name: '', description: '' },
            newChapter: { name: '', description: '', subject_id: null },
            editChapterData: { id: null, name: '', description: '' },
            showAddSubjectModal: false,
            showEditSubjectModal: false,
            vshowAddChapterModal: false,
            showEditChapterModal: false,
            subject:{
                chapters:[],
                showChapters:false
            }
        }
    },
    components: {
        Modal
    },
    mounted() {
        this.loadUser ();
        this.loadSubjects();
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
        loadSubjects() {
            fetch('/api/subject', {
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
                    console.log('No subjects found.');
                    this.subjects = [];
                    return ;
                }
            })
            .then(data => {
                this.subjects=data.map(subject=>({...subject}))
                this.subject = data.map(subject => ({
                    ...subject,
                    chapters: [], // Initialize chapters array
                    showChapters: false // Initialize showChapters property
                }));
            })
            .catch(error => console.error('Error loading subjects:', error));
        },
        loadChapters(subject) {
            fetch(`/api/chapter?subject_id=${subject.id}`, {
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
                    console.log('No chapters found for this subject.');
                    return ;
                }
            })
            .then(data => {
                this.$set(subject, 'chapters', data); // Set chapters for the subject
            })
            .catch(error => console.error('Error loading chapters:', error));
        },
        showChaptersinSubjects(subject){
            subject.showChapters = !subject.showChapters
            console.log(subject.showChapters)
            this.loadChapters(subject)
            
        },
        addSubject() {
            fetch('/api/subject', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.newSubject)
            })
            .then(response => response.json())
            .then(data => {
                this.subjects.push(data);
                this.newSubject = { name: '', description: '' };
                this.showAddSubjectModal=false// Reset form
                this.loadSubjects()
            })
            .catch(error => console.error('Error adding subject:', error));
        },
        editSubject(subject) {
            this.editSubjectData = { ...subject }; // Copy subject data for editing
            this.showEditSubjectModal = true; // Open edit modal
        },
        updateSubject() {
            fetch(`/api/subject/${this.editSubjectData.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.editSubjectData)
            })
            .then(response => response.json())
            .then(data => {
                const index = this.subjects.findIndex(subject => subject.id === data.id);
                this.subjects.splice(index, 1, data); // Update the subject in the list
                this.showEditSubjectModal = false; // Close modal
                this.loadSubjects()
            })
            .catch(error => console.error('Error updating subject:', error));
        },
        deleteSubject(id) {
            fetch(`/api/subject/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(() => {
                this.subjects = this.subjects.filter(subject => subject.id !== id); // Remove subject from the list
            })
            .catch(error => console.error('Error deleting subject:', error));
        },
        showAddChapterModal(subject) {
            this.newChapter.subject_id = subject.id; // Set the subject ID for the new chapter
            this.vshowAddChapterModal = true; // Open the add chapter modal
        },
        addChapter() {
            fetch('/api/chapter', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ ...this.newChapter })
            })
            .then(response => response.json())
            .then(data => {
                const subject = this.subjects.find(s => s.id === this.newChapter.subject_id);
                if (subject) {
                    subject.chapters.push(data); // Add the new chapter to the subject's chapters
                }
                this.vshowAddChapterModal = false; // Close modal
                this.newChapter = { name: '', description: '', subject_id: null }; // Reset form
                this.loadChapters(subject)
            })
            .catch(error => console.error('Error adding chapter:', error));
        },
        editChapter(chapter) {
            this.editChapterData = { ...chapter }; // Copy chapter data for editing
            this.showEditChapterModal = true; // Open edit modal
        },
        updateChapter() {
            fetch(`/api/chapter/${this.editChapterData.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.editChapterData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update chapter');
                }
                return response.json();
            })
            .then(data => {
                // Check if the subject exists and has chapters
                const subject = this.subjects.find(s => s.chapters && s.chapters.some(ch => ch.id === data.id));
                if (subject) {
                    const index = subject.chapters.findIndex(ch => ch.id === data.id);
                    subject.chapters.splice(index, 1, data); // Update the chapter in the list
                }
        
                console.log('Chapter updated successfully:', data); // Debugging statement
                this.showEditChapterModal = false; // Close modal after successful update
                this.loadSubjects()
            })
            .catch(error => {
                console.error('Error updating chapter:', error);
                // Optionally show an error message to the user
            });
        },
        deleteChapter(id) {
            fetch(`/api/chapter/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(() => {
                // Find the subject that contains the chapter
                const subject = this.subjects.find(s => s.chapters.some(ch => ch.id === id));
                if (subject) {
                    // Remove the chapter from the subject's chapters array
                    subject.chapters = subject.chapters.filter(chapter => chapter.id !== id);
                }
            })
            .catch(error => console.error('Error deleting chapter:', error));
        },
        csvDownload(){
            fetch('/export')
            .then(response=> response.json())
            .then(data=>{
                window.location.href=`/csv_result/${data.id}`

            })

        },
        gotoquiz(chapter_id) {
            this.$router.push(`/quiz/${chapter_id}`);
        },
        showSearch(){
            this.$router.push(`/admin/search`)
        },
        showSummary(){
            this.$router.push(`/admin/summary`)
        }
    } 
}