from app.models.quiz_model import QuizCategory


DEFAULT_QUIZ_QUESTIONS = [
    {
        "category": QuizCategory.QA,
        "question": "What is the main purpose of a test case?",
        "options": [
            "To describe how a feature should be verified",
            "To deploy code to production",
            "To replace user documentation",
            "To design the database schema",
        ],
        "correct_answer": "To describe how a feature should be verified",
    },
    {
        "category": QuizCategory.QA,
        "question": "Which item is most useful in a bug report?",
        "options": [
            "Steps to reproduce the issue",
            "The developer salary",
            "The company logo",
            "The number of meetings held",
        ],
        "correct_answer": "Steps to reproduce the issue",
    },
    {
        "category": QuizCategory.SALESFORCE,
        "question": "In Salesforce, what is an object?",
        "options": [
            "A database table-like structure for storing records",
            "A browser extension",
            "A network firewall",
            "A billing invoice only",
        ],
        "correct_answer": "A database table-like structure for storing records",
    },
    {
        "category": QuizCategory.SALESFORCE,
        "question": "Which Salesforce feature is commonly used for automation?",
        "options": ["Flow", "Canvas size", "DNS zone", "AMI"],
        "correct_answer": "Flow",
    },
    {
        "category": QuizCategory.AWS_PRACTITIONER,
        "question": "Which AWS service provides object storage?",
        "options": ["Amazon S3", "Amazon EC2", "AWS IAM", "Amazon Route 53"],
        "correct_answer": "Amazon S3",
    },
    {
        "category": QuizCategory.AWS_PRACTITIONER,
        "question": "What does IAM primarily manage?",
        "options": [
            "Users, groups, roles, and permissions",
            "Physical data center cooling",
            "Source code formatting",
            "Domain name registration only",
        ],
        "correct_answer": "Users, groups, roles, and permissions",
    },
    {
        "category": QuizCategory.AWS_SOLUTIONS_ARCHITECT,
        "question": "What improves high availability for an application?",
        "options": [
            "Deploying across multiple Availability Zones",
            "Using one server in one rack",
            "Removing backups",
            "Disabling health checks",
        ],
        "correct_answer": "Deploying across multiple Availability Zones",
    },
    {
        "category": QuizCategory.AWS_SOLUTIONS_ARCHITECT,
        "question": "Which service distributes traffic across targets?",
        "options": [
            "Elastic Load Balancing",
            "AWS CloudTrail",
            "Amazon S3 Glacier",
            "AWS Budgets",
        ],
        "correct_answer": "Elastic Load Balancing",
    },
]
