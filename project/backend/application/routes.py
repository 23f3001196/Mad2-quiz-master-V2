from .database import db
from .models import *
from .utils import roles_list
from app import app
from .resources import *
from flask import jsonify,request,render_template,redirect,url_for
from flask_security import auth_required,roles_required,roles_accepted,current_user,login_user, logout_user, login_required,hash_password
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from sqlalchemy import or_
from sqlalchemy import func

import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt



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

@app.route('/admin/search', methods=["POST"])
@auth_required('token')
@roles_required('admin')
def admin_search():
   

    results=[]
        
    search_by = request.json.get('Search_by')
    search_text = request.json.get('text')

    if search_by == 'subject':
        results = Subject.query.filter(
            Subject.name.contains(search_text)).all()
    elif search_by == 'users':
        results = User.query.filter(or_(
            User.username.contains(search_text),
            User.full_name.contains(search_text),
            User.qualification.contains(search_text),
            )).all()
    elif search_by == 'quiz':
        results = Quiz.query.join(Chapter).filter(or_(
            Quiz.title.contains(search_text),
            Quiz.date_of_quiz.contains(search_text),#check
            Quiz.time_duration.contains(search_text),
            Chapter.name.contains(search_text)
        )).all()

    results_data = []
    for result in results:
        result_dict = {key: value for key, value in result.__dict__.items() if not key.startswith('_')}
        results_data.append(result_dict)
    return jsonify({
        'results': results_data,
        'search_by': search_by,
        'search_text': search_text
    }), 200
    
    

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


@app.route('/admin/summary')
@auth_required('token')
@roles_required('admin')
def admin_summary():
   
    top_quizzes = Quiz.query.join(Score).group_by(Quiz.id).order_by(func.avg(Score.total_score).desc()).all()#.limit(5)to get top 5

    # Get the number of users who have attempted each quiz
    quiz_attempts = []
    average_scores = []
    for quiz in top_quizzes:
        attempts = Score.query.filter_by(quiz_id=quiz.id).count()
        average_score = db.session.query(func.avg(Score.total_score)).filter_by(quiz_id=quiz.id).scalar()
        quiz_attempts.append(attempts)
        average_scores.append(average_score if average_score is not None else 0)  # Handle None case

    # Create a bar chart to display the top quizzes and their average scores
    labels = [quiz.title for quiz in top_quizzes]
    plt.clf()
    plt.bar(labels, average_scores)
    plt.title('Top Quizzes by Average Score')
    plt.xlabel('Quiz Title')
    plt.ylabel('Average Score')
    plt.savefig('frontend/source/admin_top_quizzes.png')

    # Create a pie chart to display the distribution of quiz attempts
    plt.clf()
    plt.pie(quiz_attempts, labels=labels, autopct='%1.1f%%')
    plt.title('Quiz Attempts Distribution')
    plt.savefig('frontend/source/admin_quiz_attempts.png')

    return jsonify({"message":"successful"}),200


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


@app.route('/user/search', methods=["POST"])
@auth_required('token')
@roles_required('user')
def user_search():
    results = []
        
    search_by = request.json.get('Search_by')
    search_text = request.json.get('text')

    if search_by == 'subject':
        results = Subject.query.filter(
            Subject.name.contains(search_text)).all()
    elif search_by == 'quiz':
        # Attempt to parse the search_text as a date
        try:
            search_date = datetime.strptime(search_text, '%Y-%m-%d')  # Adjust format as needed
            results = Quiz.query.join(Chapter).filter(or_(
                Quiz.title.contains(search_text),
                Quiz.date_of_quiz == search_date,  # Compare with parsed date
                Quiz.time_duration.contains(search_text),
                Chapter.name.contains(search_text)
            )).all()
        except ValueError:
            # If parsing fails, treat search_text as a string for title and time_duration
            results = Quiz.query.join(Chapter).filter(or_(
                Quiz.title.contains(search_text),
                Quiz.time_duration.contains(search_text),
                Chapter.name.contains(search_text)
            )).all()

    elif search_by == 'scores':
        try:
            score_value = int(search_text)  # Convert search_text to int for score comparison
            results = Quiz.query.join(Score).join(Chapter).filter(or_(
                Score.total_score == score_value,  # Corrected this line
                Quiz.time_duration.contains(search_text),
                Chapter.name.contains(search_text)
            )).all()
        except ValueError:
            results = Quiz.query.join(Score).join(Chapter).filter(or_(
                Quiz.time_duration.contains(search_text),
                Chapter.name.contains(search_text)
            )).all()

    # Prepare results for JSON response
    results_data = []
    for result in results:
        result_dict = {key: value for key, value in result.__dict__.items() if not key.startswith('_')}
        # Include chapter name if the result is a quiz
        if hasattr(result, 'chapter'):
            result_dict['chapter_name'] = result.chapter.name  # Assuming the relationship is set up
        results_data.append(result_dict)

    return jsonify({
        'results': results_data,
        'search_by': search_by,
        'search_text': search_text
    }), 200

@app.route('/user/summary/<int:user_id>')
@auth_required('token')
def user_summary(user_id):
    
    user_scores=db.session.query(Score, Quiz).join(Quiz).filter(Score.user_id == user_id).all()

    # Lists to store the data for the charts
    quiz_titles = []
    user_scores_list = []
    quiz_attempts = []

    # Process the user scores for each quiz
    for score, quiz in user_scores:
        quiz_titles.append(quiz.title)
        user_scores_list.append(score.total_score)
        attempts = Score.query.filter_by(quiz_id=quiz.id).count()
        quiz_attempts.append(attempts)

    # Create a bar chart for the user's quiz performance
    plt.clf()
    plt.bar(quiz_titles, user_scores_list, color='blue')
    plt.title(f'User Performance: {user_id}')
    plt.xlabel('Quiz Title')
    plt.ylabel('Total Score')
    
    plt.tight_layout()  # To make sure labels fit well in the plot

    # Save the user's performance chart as an image
    
    plt.savefig('frontend/source/user_performance.png')

    # Create a pie chart for the distribution of quiz attempts
    plt.clf()
    plt.pie(quiz_attempts, labels=quiz_titles)
    plt.title(f'Quiz Attempt Distribution: {user_id}')
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.

    plt.savefig('frontend/source/user_quiz.png')

    return jsonify({
        "message": "Charts generated successfully",
    }), 200
    