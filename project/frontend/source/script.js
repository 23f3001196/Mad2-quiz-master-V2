import Home from './components/home.js'
import Login from './components/login.js'
import Register from './components/register.js'
import Navbar from './components/navbar.js'
import Footer from './components/footer.js'
import Admin from './components/admin.js'
import User from './components/user.js'
import Quiz from './components/quiz.js'
import Scores from './components/score.js'
import ASearch from './components/admin_search.js'
import ASumm from './components/admin_summary.js'
import USearch from './components/user_search.js'
import USumm from './components/user_summary.js'

const routes = [
    {path: '/', component: Home},
    {path: '/userlogin', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: Admin},
    {path:'/user',component:User},
    {path:'/quiz/:chapter_id',component:Quiz},
    {path:'/score',component:Scores},
    {path:'/admin/search',component:ASearch},
    {path:'/admin/summary',component:ASumm},
    {path:'/user/search',component:USearch},
    {path:'/user/summary/:user_id',component:USumm}
    
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