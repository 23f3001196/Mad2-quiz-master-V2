from celery import shared_task
#to import the celery object outside 
from .models import *
import datetime
import csv
import json
import requests
from .utils import format_report
from .mail import send_email



@shared_task(ignore_results=False,name="download_csv_report")
def csv_report():
    # user=User.query.get()
    scores=Score.query.all()
    # user_scores=user.score
    d=datetime.datetime.now().strftime('%f')
    csv_file_name = f"scores_{d}.csv"
    with open(f'../frontend/source/{csv_file_name}','w',newline="") as csvfile:
        sr_no = 1
        score_csv=csv.writer(csvfile,delimiter=",")
        score_csv.writerow(['Sr No.','Quiz id','User_id','Date of quiz','Score','No of questions'])
        for s in scores:
            sc=[sr_no,s.quiz_id,s.user_id,s.time_stamp_of_attempt,s.total_score,s.no_of_questions]
            score_csv.writerow(sc)
            sr_no+=1

    return csv_file_name



@shared_task(ignore_results=False,name="monthly_report")
def monthly_report():#monthly shceduled 
    users=User.query.all()
    for u in users[1:]:
        user_data={}
        user_data['username']=u.username
        user_data['email']=u.email
        user_scores=[]
        for score in u.scores:
            t_s={}
            t_s["id"]=score.id
            t_s["quiz_id"]=score.quiz_id
            quiz=Quiz.query.filter_by(id=score.quiz_id).first()
            t_s["chapter_id"] = quiz.chapter_id
            chapter=Chapter.query.filter_by(id=quiz.chapter_id).first()
            t_s["chapter_name"]=chapter.name
            t_s["total_score"]=score.total_score
            t_s["no_of_questions"]=score.no_of_questions
            t_s["total_score_quiz"]=score.total_score_quiz
            user_scores.append(t_s)
        user_data['user_scores']=user_scores
        message=format_report('../frontend/templates/mail.html',user_data)
        send_email(u.email, subject="Monthly score card-Quiz master",message=message)

    return "Monthly reports sent"     
@shared_task(ignore_results=False,name="daily_update")
def daily_update():  # Get daily update
    users = User.query.all()
    d = datetime.date.today()
    
    for user in users:  # Loop through all users
        # Check for quizzes that are scheduled for today
        new_quizzes = Quiz.query.filter(Quiz.date_of_quiz == d, Quiz.date_of_quiz > user.last_reminder_time).all()
        visited_quiz_ids = [score.quiz_id for score in user.scores]
        reminders = [quiz for quiz in new_quizzes if quiz.id not in visited_quiz_ids]

        if reminders:
            user.last_reminder_time = datetime.datetime.now()  # Set to current time
            db.session.commit()

            quiz_titles = ', '.join([quiz.title for quiz in reminders])
            text = f"Hi {user.username}, new quizzes {quiz_titles} have been added. Please check the app at http://127.0.0.1:5000"

            # Send the reminder message
            response = requests.post(
                "https://chat.googleapis.com/v1/spaces/AAQA2OJSNGY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=YNVHmcoQdMuUsBck3wOqa5_z0J69bUJ8s-nqjwv2aOc",
                headers={"Content-Type": "application/json"},
                json={"text": text}
            )
    
    return "Today's quiz reminders sent."

@shared_task(ignore_results=False,name="daily_update_score")
def daily_update_score(user_id, quiz_id):
    # Fetch the user and quiz details
    user = User.query.get(user_id)
    quiz = Quiz.query.get(quiz_id)
    
    if user and quiz:
        score = Score.query.filter_by(user_id=user.id, quiz_id=quiz.id).first()
        if score:
             
            text = f"Hi {user.username}, your score has been updated for the quiz {quiz.title}. Please check the app at http://127.0.0.1:5000"

            # Send the message (e.g., to a chat API)
            response = requests.post("https://chat.googleapis.com/v1/spaces/AAQA2OJSNGY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=YNVHmcoQdMuUsBck3wOqa5_z0J69bUJ8s-nqjwv2aOc",
                headers={"Content-Type": "application/json"},
                json={"text": text}
            )
            return "Score updated and message sent."
    return "User  or quiz not found."


