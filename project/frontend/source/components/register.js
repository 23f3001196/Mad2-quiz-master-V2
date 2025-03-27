export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <h2 class="text-center">Register Form</h2>
                    <div>
                        <label for="email">Enter your email:</label>
                        <input type="text" id="email" v-model="formData.email">
                    </div>
                    <div>
                        <label for="username">Enter your username:</label>
                        <input type="text" id="username" v-model="formData.username">
                    </div>
                    <div>
                        <label for="password">Enter your password:</label>
                        <input type="password" id="password" v-model="formData.password">
                    </div>
                    <br>
                    <div>
                        <label for="fullname">Fullname:</label>
                        <input type="text" id="name"  v-model="formData.fullname">
                    </div>
                    <br>
                    <div>
                        <label for="qualification">Qualification:</label>
                        <input type="text" id="qualification"  v-model="formData.qualification">
                    </div>
                    <br>
                    <div>
                        <label for="dob">Date-of-birth:</label>
                        <input type="date" id="dob"  v-model="formData.dateofbirth">
                    </div>
                    <br>
                    <div>
                        <button class="btn btn-primary" @click="addUser">Register</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            formData:{
                email: "",
                password: "",
                username: "",
                fullname:"",
                qualification:"",
                dateofbirth:""
            } 
        }
    },
    methods:{
        addUser: function(){
            fetch('/register', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData) // the content goes to backend as JSON string
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/userlogin')
            })

        }
    }
}