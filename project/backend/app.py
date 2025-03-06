from flask import Flask
from application.config import LocalDevelopmentConfig
from application.database import db
from application.models import User,Role

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()  # Create all tables

if __name__ == "__main__":
    app.run(debug=True)

#update