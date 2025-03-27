from flask_restful import Api,Resource,reqparse
from flask import request
from .models import *
from .utils import roles_list
from flask_security import auth_required,roles_required,roles_accepted,current_user
from datetime import datetime
api=Api()


parser = reqparse.RequestParser()

parser.add_argument('name',required=True, help="Name cannot be blank")
parser.add_argument('description')

class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('admin','user')
    def get(self):
        l=[]
        l_json=[]
        if "admin" in roles_list(current_user.roles):
            l=Subject.query.all()
        else:
            l=current_user.subject
        
        for i in l:
            dic={}
            dic["id"]=i.id
            dic["name"]=i.name
            dic["description"]=i.description
            l_json.append(dic)
        
        if l_json:
            return l_json,200
        
        return {
            "message":"No Subject found"
        },201

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = parser.parse_args()
        try:
            l = Subject(name=args["name"],description=args["description"])

            db.session.add(l)
            db.session.commit()
            return{
                "message":"Subject created Successfully"
            }, 200

        except:
            return{
                "message":"Fields are missing"
            }, 400
        
    @auth_required('token')
    @roles_required('admin')
    def put(self,sub_id):
        args = parser.parse_args()
        subject = Subject.query.get(sub_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        
        try:
            subject.name = args["name"]
            subject.description = args["description"]
            db.session.commit()
            return {"message": "Subject updated successfully"}, 200
        except :
            return {"error": "Subject could not be updated"}, 400  
        
    @auth_required('token')
    @roles_required('admin')
    def delete(self, sub_id):
        subject = Subject.query.get(sub_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        
        try:
            db.session.delete(subject)
            db.session.commit()
            return {"message": "Subject deleted successfully"}, 200
        except :
            return {"error": "Could not delete"}, 400
 

api.add_resource(SubjectApi,'/api/subject', '/api/subject/<int:sub_id>')

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', required=True, help="Name cannot be blank")
chapter_parser.add_argument('subject_id')
chapter_parser.add_argument('description')

class ChapterApi(Resource):

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = chapter_parser.parse_args()
        try:
            new_chapter = Chapter(name=args["name"],subject_id=args["subject_id"],description=args["description"])
            db.session.add(new_chapter)
            db.session.commit()
            return {"message": "Chapter created successfully"}, 200
        except:
            return {"error": "Could not delete"}, 400


    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        try:
            chapter.name = args["name"]
            chapter.description=args["description"]
            chapter.subject_id=chapter.subject_id
            db.session.commit()
            return {"message": "Chapter updated successfully"}, 200
        except:
            return {"error": "Subject could not be updated"}, 400 

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):
        c = Chapter.query.get(chapter_id)
        if not c:
            return {"message": "Chapter not found"}, 404
        try:
            db.session.delete(c)
            db.session.commit()
            return {"message": "Chapter deleted successfully"}, 200
        except:
            return {"error":"Could not delete"}, 400
        

api.add_resource(ChapterApi, '/api/chapter', '/api/chapter/<int:chapter_id>')


quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('title', required=True, help="Title cannot be blank")
quiz_parser.add_argument('chapter_id')
quiz_parser.add_argument('date_of_quiz',required=True, help="date of quiz cannot be blank")
quiz_parser.add_argument('time_duration')
quiz_parser.add_argument('remarks')

class QuizApi(Resource):
    
    @auth_required('token')
    @roles_required('user')
    def get(self):
        quizzes=Quiz.query.all()
        if quizzes:
            return [{"id": quiz.id, "title": quiz.title, "chapter_id": quiz.chapter_id,"date_of_quiz":quiz.date_of_quiz.strftime('%Y-%m-%d'),"time_duration":quiz.time_duration,"remarks":quiz.remarks,"chapter_name":quiz.chapter.name} for quiz in quizzes], 200
        return {"message": "No quizzes found"}, 201

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = quiz_parser.parse_args()
        try:

            d=args["date_of_quiz"]
            date=datetime.strptime(d, "%Y-%m-%d").date()
            new_quiz = Quiz(title=args["title"], chapter_id=args["chapter_id"],date_of_quiz=date,time_duration=args["time_duration"],remarks=args["remarks"])
            db.session.add(new_quiz)
            db.session.commit()
            return {"message": "Quiz created successfully"}, 200
        except:
            return {"error": "could not be created"}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        args = quiz_parser.parse_args()
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        try:
            quiz.title = args["title"]
            quiz.date_of_quiz=datetime.strptime(args["date_of_quiz"], "%Y-%m-%d").date()
            quiz.time_duration=args["time_duration"]
            quiz.remarks=args["remarks"]
            db.session.commit()
            return {"message": "Quiz updated successfully"}, 200
        except:
            return {"error": "Subject could not be updated"}, 400 

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        q = Quiz.query.get(quiz_id)
        if not q:
            return {"message": "Quiz not found"}, 404
        try:
            db.session.delete(q)
            db.session.commit()
            return {"message": "Quiz deleted successfully"}, 200
        except:
            return {"error":"Could not delete"}, 400

api.add_resource(QuizApi, '/api/quiz', '/api/quiz/<int:quiz_id>')

question_parser = reqparse.RequestParser()
question_parser.add_argument('question_statement', required=True, help="Question cannot be blank")
question_parser.add_argument('quiz_id')
question_parser.add_argument('option1')
question_parser.add_argument('option2')
question_parser.add_argument('option3')
question_parser.add_argument('option4')
question_parser.add_argument('correct_answer')
question_parser.add_argument('marks')

class QuestionApi(Resource):

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = question_parser.parse_args()
        try:
            new_question = Question(
                question_statement=args["question_statement"],
                quiz_id=args["quiz_id"],
                option1=args["option1"],
                option2=args["option2"],
                option3=args["option3"],
                option4=args["option4"],
                correct_answer=args["correct_answer"],
                marks=args["marks"]
            )
            db.session.add(new_question)
            db.session.commit()
            return {"message": "Question created successfully"}, 201
        except Exception as e:
            db.session.rollback()  # Rollback the session in case of error
            return {"error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        args = question_parser.parse_args()
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        try:
            question.question_statement = args["question_statement"]
            question.option1=args["option1"]
            question.option2=args["option2"]
            question.option3=args["option3"]
            question.option4=args["option4"]
            question.correct_answer=args["correct_answer"]
            question.marks=args["marks"]
            db.session.commit()
            return {"message": "Question updated successfully"}, 200
        except Exception as e:
            db.session.rollback()  # Rollback the session in case of error
            return {"error": str(e)}, 400 

    @auth_required('token')
    @roles_required('admin')
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        try:
            db.session.delete(question)
            db.session.commit()
            return {"message": "Question deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()  # Rollback the session in case of error
            return {"error": str(e)}, 400

# Add the resource to the API
api.add_resource(QuestionApi, '/api/question', '/api/question/<int:question_id>')

