class Config():#Normal configurations 
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    #for using locally
    SQLALCHEMY_DATABASE_URI = "sqlite:///MAD2-project.sqlite3"#
    DEBUG = True #In development mode.//it is same as config class in local development it is true used for giving errors and running automatically after changes.

    #config for security
    SECRET_KEY = "567gh-MAD2PROJECT-QUIZMASTER"#hash user creds in session
    SECURITY_PASSWORD_HASH = "bcrypt"# mechanism for hashing password so even developer can't see === generally bcrypt is used
    SECURITY_PASSWORD_SALT = "37DFRGBH-MAD2-PROJECT-ON-QUIZ-MASTER-2005psswd-check "#helps in hashing password
    WTF_CSRF_ENABLED = False #development false production is true//
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"