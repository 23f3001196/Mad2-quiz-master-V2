# Mad2-quiz-master-V2
It is a multi-user app (one requires an administrator and other users) that acts as an exam preparation site for multiple courses. The approach I took is first created the basic backend which is models, app etc,.. and basic frontend worked on linking the backend and frontend, I focused on backend. After the basic functionalities worked on monthly report, csv download, daily remainders and cache later did basic fixes.

Frameworks and libraries Used:
Flask: for the backend including flask-caching, flask-restful flask-sqlalchemy for database accessing creating etc.., flask-security etc ,..
Sqlite3: database interactions
Bcrypt: for security purposes
Matplotlib: for graphs
Celery-redis: for backend jobs monthly reports , csv
Vue-CDN: to access frontend
Javascript: for frontend development
Html and bootstrap: bootstrap for designing and html only basic and email format
Jinja2 template only for basic email and email related 


API:
api/subject- for get and post methods for subject
/api/subject/<int:id>-for put and delete methods for subject
/api/chapter- for get and post methods for chapter
/api/chapter/<int:id>-for put and delete methods for chapter
/api/quiz- for get and post methods for quiz
/api/quiz/<int:id>-for put and delete methods for quiz
/api/question - for get and post methods for question
/api/question /<int:id>-for put and delete methods for question
