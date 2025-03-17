from flask import Flask
from application.config import LocalDevelopmentConfig
from application.database import db
from application.models import User,Role
from flask_security import Security,SQLAlchemyUserDatastore,hash_password


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)#for security creating datastore then using datastore for security applying
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin",description="Main User handles everything")
    app.security.datastore.find_or_create_role(name="user",description="general user")
    db.session.commit()#first roles should be there in the database so it can be accessed

    if not app.security.datastore.find_user(email="admin_quizmaster@admin.com"):
        app.security.datastore.create_user(email="admin_quizmaster@admin.com",username="admin01",password=hash_password("admin2005"),roles=['admin'])
    
    if not app.security.datastore.find_user(email="user1@user.com"):
        app.security.datastore.create_user(email="user1@user.com",username="user01",password=hash_password("user2005"),roles=['user'])
    db.session.commit()

from application.routes import *

if __name__ == "__main__":
    app.run()


#RBAC and authentication