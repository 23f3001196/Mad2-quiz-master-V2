import Home from './components/home.js'
import Login from './components/login.js'
import Register from './components/register.js'
import Navbar from './components/navbar.js'
import Footer from './components/footer.js'
import Admin from './components/admin.js'
import User from './components/user.js'
import Quiz from './components/quiz.js'
import Scores from './Components/score.js'

const routes = [
    {path: '/', component: Home},
    {path: '/userlogin', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: Admin},
    {path:'/user',component:User},
    {path:'/quiz/:chapter_id',component:Quiz},
    {path:'/score',component:Scores}
    
]

const router = new VueRouter({
    routes // routes: routes
})

const app = new Vue({
    el: "#app",
    router, // router: router
    template: `
    <div class="container">
        <nav-bar></nav-bar>
        
        <router-view></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        section: "Frontend",
    },
    components:{
        "nav-bar": Navbar,
        "foot": Footer
    }
    
}) 