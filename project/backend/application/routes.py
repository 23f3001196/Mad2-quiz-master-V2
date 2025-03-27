from .database import db
from .models import *
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
        "id":u.id,
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

@app.route('/api/q', methods=['GET'])
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
        return [{"id": question.id, "question_statement": question.question_statement, "quiz_id": question.quiz_id,"option1":question.option1,"option2":question.option2,"option3":question.option3,"option4":question.option4,"correct_answer":question.correct_answer,"marks":question.marks} for question in questions], 200
    return {"message": "No questions found"}, 201
    

@app.route('/api/qu/<int:quiz_id>',methods=['GET'])
@auth_required('token')
@roles_required('user')
def get_quizques(quiz_id):
    quiz = Quiz.query.get(quiz_id)  # Assuming Quiz is your model

    if not quiz:
        return {"message": "Quiz not found"}, 404  # Return 404 if quiz does not exist

    questions = quiz.questions  


    q = [{
        "id": question.id,
        "question_statement": question.question_statement,
        "option1": question.option1,
        "option2": question.option2,
        "option3": question.option3,
        "option4": question.option4,
        "correct_answer": question.correct_answer,
        "marks": question.marks
    } for question in questions]

    return jsonify({"quiz_id": quiz_id, "questions": q}), 200

from flask import request, jsonify
from flask_restful import Resource

@app.route('/submit_quiz', methods=['POST'])
@auth_required('token')
@roles_required('user')
def submit_quiz():
    data = request.get_json()  # Get the JSON data from the request

    quiz_id = data.get('quiz_id')
    user_id = data.get('user_id')
    answers = data.get('answers')

    if not quiz_id or not user_id or not answers:
        return jsonify({"message": "Invalid data"}), 400  # Bad request

    
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404  # Not found

    
    score = 0
    total_s=0
    q=0
    for question in quiz.questions:
        total_s+=question.marks
        q+=1
        user_answer = answers.get(str(question.id)) 
        if user_answer is not None:  # Check if the user answer exists
            if str(user_answer) == str(question.correct_answer):
                score += question.marks

    s=Score(user_id=user_id,quiz_id=quiz_id,total_score=score,time_stamp_of_attempt=datetime.now(),total_score_quiz=total_s,no_of_questions=q)
    db.session.add(s)
    db.session.commit()

    return jsonify({"message": "Quiz submitted successfully", "score": score,"total_score":total_s}), 200  # Success

@app.route('/score', methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_score():
    user_id = request.args.get('user_id')  
    if not user_id:
        return jsonify({"message": "User  ID is required"}), 400  # Bad request if user_id is not provided
    scores = Score.query.filter_by(user_id=user_id).all()

    if not scores:
        return jsonify([]), 200  # Return an empty list if no scores are found

    scores_data = []
    for score in scores:
        scores_data.append({
            "id": score.id,
            "quiz_id": score.quiz_id,
            "total_score": score.total_score,
            "time_stamp_of_attempt": score.time_stamp_of_attempt.isoformat(),  # Convert to ISO format for JSON
            "no_of_questions": score.no_of_questions,
            "total_score_quiz": score.total_score_quiz
        })

    return jsonify(scores_data), 200  

