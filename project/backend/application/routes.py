from .database import db
from .models import User
from .utils import roles_list
from app import app
from .resources import *
from flask import jsonify,request,render_template,redirect,url_for
from flask_security import auth_required,roles_required,roles_accepted,current_user,login_user, logout_user, login_required,hash_password
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime




@app.route('/', methods = ['GET'])
def home():
    return render_template('index.html')

@app.route('/home')
@auth_required('token')
@roles_accepted('user', 'admin')#and
def user_home():
    u = current_user
    return jsonify({
        "username": u.username,
        "email": u.email,
        "roles": roles_list(u.roles)[0]
    })

@app.route('/admin')
@auth_required('token') # Authentication
@roles_required('admin') # RBAC/Authorization
def admin_home():
    return jsonify({
        "message": "admin logged in successfully"
    })



@app.route('/quiz/<int:chapter_id>', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_quiz(chapter_id):
    return jsonify({
        "message": "Quiz page accessed",
        "chapter_id": chapter_id
        # You can add more data related to the chapter if needed
    })

@app.route('/userlogin', methods=['POST'])
def user_login():
    r = request.get_json()
    email = r["email"]
    password = r["password"]

    if not email:
        return jsonify({"message": "no email provided"}), 400
    
    user = app.security.datastore.find_user(email = email)

    if user:
        if check_password_hash(user.password,password):
            login_user(user)
            return jsonify({
                "auth_token": user.get_auth_token(), 
                "roles": roles_list(user.roles),
                "id": user.id,
                "username":user.username
        
                }), 200
        return jsonify({"message": "incorrect password for the user"}), 400
    return jsonify({"message": "User not found!"}), 404
    

    
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()  # This should clear the session
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/register', methods=['POST'])
def create_user():
    r = request.get_json()
    if not app.security.datastore.find_user(email = r["email"]):
        dob = datetime.strptime(r["dateofbirth"], "%Y-%m-%d").date()
        app.security.datastore.create_user(email = r["email"],username = r["username"],password =generate_password_hash(r["password"]),full_name=r["fullname"],qualification=r["qualification"],dob=dob,roles = ['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
        }), 201
    
    return jsonify({
        "message": "User already exists!"
    }), 400




@app.route('/user')
@auth_required('token')
@roles_required('user')#and 
def user_dash():
    user=current_user()
    return "<h1>this is user</h1>"

@app.route('/api/chapter', methods=['GET'])
@auth_required('token')
@roles_accepted('admin','user')
def get_chapters():
    subject_id=request.args.get('subject_id')
    chapters = Chapter.query.filter_by(subject_id=subject_id).all()
    if chapters:
        return [{"id": chapter.id, "name": chapter.name, "description": chapter.description} for chapter in chapters], 200
    return {"message": "No chapters found"}, 201

@app.route('/api/quiz', methods=['GET'])
@auth_required('token')
@roles_accepted('admin','user')
def get_quizzes():
    chapter_id=request.args.get('chapter_id')
    quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
    if quizzes:
        return [{"id": quiz.id, "title": quiz.title, "chapter_id": quiz.chapter_id,"date_of_quiz":quiz.date_of_quiz,"time_duration":quiz.time_duration,"remarks":quiz.remarks} for quiz in quizzes], 200
    return {"message": "No quizzes found"}, 201
    
@app.route('/api/question', methods=['GET'])
@auth_required('token')
@roles_accepted('admin','user')
def get_questions():
    quiz_id=request.args.get('quiz_id')
    questions=Question.query.filter_by(quiz_id=quiz_id).all()
    if questions:
        return [{"id": question.id, "question_statement": question.question_statement, "quiz_id": question.quiz_id,"option1":question.option1,"option2":question.option2,"option3":question.option3,"option4":question.option4,"correct_option":question.correct_option,"marks":question.marks} for question in questions], 200
    return {"message": "No questions found"}, 201
    

