from flask import Flask 
from application.database import db 
from application.models import User, Role 
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from application.celery_init import celery_init_app
from application.tasks import *
from celery.schedules import crontab


def create_app():
    app = Flask(__name__,static_folder='../frontend/source',template_folder='../frontend/templates')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()
celery= celery_init_app(app)
celery.autodiscover_tasks()



with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name = "admin", description = "Superuser of app")
    app.security.datastore.find_or_create_role(name = "user", description = "General user of app")
    db.session.commit()
    if not app.security.datastore.find_user(email = "admin_quizmaster@admin.com"):
        app.security.datastore.create_user(email = "admin_quizmaster@admin.com",
                                           username = "admin01",
                                           password = generate_password_hash("admin2005"),
                                           roles = ['admin'])
        
    if not app.security.datastore.find_user(email = "user1@user.com"):
        app.security.datastore.create_user(email = "user1@user.com",
                                           username = "user01",
                                           password = generate_password_hash("user2005"),
                                           roles = ['user'])
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        # crontab(hour=7,minute=30,day_of_week=1),
        crontab(minute = '*/2'),
        monthly_report.s(),
    )
    sender.add_periodic_task(
        # crontab(hour=18, minute=0),
        crontab(minute = '*/2'),
        daily_update.s(),
    )

if __name__ == "__main__":
    app.run()


#RBAC and authentication