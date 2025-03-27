from .database import db
from flask_security import UserMixin,RoleMixin



class User(db.Model,UserMixin):
    __tablename__="user"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(), unique=True, nullable=False)#security uses
    username=db.Column(db.String(),unique=True,nullable=False)
    password = db.Column(db.String(), nullable=False)
    fs_uniquifier = db.Column(db.String(),unique=True,nullable=False)#allows user to use endpoints to access apis
    active = db.Column(db.Boolean,nullable=False,default=True)#why active
    full_name = db.Column(db.String())
    qualification = db.Column(db.String())
    dob = db.Column(db.Date)
    roles = db.relationship('Role', backref='bearer',secondary='users_role')
    Scores = db.relationship('Score', backref='user')
    

# Role Model
class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), unique=True)
    description=db.Column(db.String())

class UsersRoles(db.Model):
    __tablename__ = 'users_role'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    role_id = db.Column(db.Integer,db.ForeignKey('role.id'),nullable=False)
    


class Subject(db.Model):
    __tablename__="subject"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False,unique=True)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', backref='subject', cascade='all')

class Chapter(db.Model):
    __tablename__="chapter"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False,unique=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'),nullable=False)
    description = db.Column(db.Text)
    quizzes = db.relationship('Quiz', backref='chapter', cascade='all')

class Quiz(db.Model):
    __tablename__="quiz"
    id = db.Column(db.Integer, primary_key=True)
    title=db.Column(db.String(), nullable=False,unique=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'),nullable=False)
    date_of_quiz = db.Column(db.DateTime)
    time_duration = db.Column(db.String())#check
    remarks = db.Column(db.String())
    questions = db.relationship('Question', backref='quiz', cascade='all')


class Question(db.Model):
    __tablename__="question"
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'),nullable=False)
    question_statement = db.Column(db.String())
    option1 = db.Column(db.String())
    option2 = db.Column(db.String())
    option3 = db.Column(db.String())
    option4 = db.Column(db.String())
    correct_answer = db.Column(db.String())
    marks=db.Column(db.Integer)

class Score(db.Model):
    __tablename__="score"
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'),nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime)
    total_score = db.Column(db.Integer)
    total_score_quiz=db.Column(db.Integer)
    no_of_questions = db.Column(db.Integer)

#update