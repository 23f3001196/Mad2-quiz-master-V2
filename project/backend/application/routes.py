from .database import db
from .models import User,Role
from app import app
from flask import jsonify,request,render_template
from flask_security import hash_password,auth_required,roles_required,roles_accepted,current_user,login_user
from werkzeug.security import check_password_hash, generate_password_hash

@app.route('/api/admin')
@auth_required('token') # Authentication
@roles_required('admin') # RBAC/Authorization
def admin_home():
    return jsonify({
        "message": "admin logged in successfully"
    })

@app.route('/login',methods=['POST'])
def login():
    r=request.get_json()
    email=r['email']
    psswd=r['password']

    if not email or not psswd: 
        return jsonify({
            "error":"Invalid credentials!!"
        }), 400
    
    u=app.security.datastore.find_user(email=email)
    if not u:
         return jsonify({
            "error":"User not found!!"
        }), 404
    

    if check_password_hash(psswd,u.password):
        login_user(u)
        token = u.get_auth_token()
        return jsonify({'auth_token':token}),200
    
    return jsonify({'error':'Wrong Password!!!'}),404


@app.route('/register', methods=['POST'])
def create_user():
    r = request.get_json()
    if not app.security.datastore.find_user(email = r["email"]):
        app.security.datastore.create_user(email = r["email"],username = r["username"],password = generate_password_hash(r["password"]),fullname=r["fullname"],qualification=r["qualification"],dob=r["dateofbirth"],roles = ['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
        }), 201
    
    return jsonify({
        "message": "User already exists!"
    }), 400




@app.route('/admin')
@auth_required('token')#Authentication
@roles_required('admin')#RBAC/authorisation
def admin_dash():
    return "<h1>this is admin</h1>"

@app.route('/user')
@auth_required('token')
@roles_required('user')#and 
def user_dash():
    user=current_user()
    return "<h1>this is user</h1>"




