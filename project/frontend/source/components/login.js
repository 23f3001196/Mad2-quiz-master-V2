export default {
    template: `
    <div class="container">
        <div class="row justify-content-center" style="height: 100vh;">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h2 class="text-center">Login Form</h2>
                        <p class="text-danger text-center">{{ message }}</p>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" v-model="formData.password" required>
                        </div>
                        <div class="d-grid text-center">
                            <button class="btn btn-primary" @click="loginUser ">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    data: function(){
        return {
            formData:{
                email: "",
                password: ""
            }
        }
    },
    methods:{
        async loginUser(){
            let response = await fetch("/userlogin", {
                headers:{"Content-Type": "application/json"},
                method : "POST",
                body : JSON.stringify(this.formData)});
            let output = await response.json()
            if (response.ok){    
                localStorage.setItem("auth_token", output.auth_token);
                localStorage.setItem("roles", JSON.stringify(output.roles)); // Store roles as a JSON string
                localStorage.setItem("id", output.id);
                localStorage.setItem("username", output.username);

                // Redirect based on roles
                if (output.roles.includes("admin")) {
                    this.$router.push('/admin');
                } else if (output.roles.includes("user")) {
                    this.$router.push('/user');
                }
            } else {
                // Display error message
                this.message = output.message || "Login failed. Please try again.";
            }
        }
    }
}