const Course = require('../models/Course');
const Question = require('../models/Question');
const UserAttempt = require('../models/UserAttempt');

// Courses
exports.getCourses = async (req, res) => {
  try {
    let courses = await Course.find().sort('name');

    // Auto-seed default courses if none exist
    if (courses.length === 0) {
      const defaultCourses = [
        { name: 'B.Sc CS', description: 'Bachelor of Science in Computer Science' },
        { name: 'M.Sc CS (Web technologies)', description: 'M.Sc Computer Science – Web Technologies specialization' },
        { name: 'M.Sc CS (AI & ML)', description: 'M.Sc Computer Science – AI & ML specialization' },
        { name: 'MCA', description: 'Master of Computer Applications' },
        { name: 'M.Sc AI & ML', description: 'Master of Science in Artificial Intelligence & Machine Learning' }
      ];

      await Course.insertMany(defaultCourses);
      courses = await Course.find().sort('name');
    }

    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Course name is required' });

    const existing = await Course.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Course already exists' });

    const course = await Course.create({ name, description });
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Questions
exports.getQuestionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, difficulty } = req.query || {};

    let questions = await Question.find({ course: courseId }).sort('createdAt');

    // Ensure this course has the code-defined sample questions as well, without removing
    // any existing questions. We avoid duplicates by checking question text.
    const course = await Course.findById(courseId);
    if (course) {
      const name = course.name;

        const questionBank = {
          'B.Sc CS': {
            easy: [
              {
                text: 'In C language, which symbol is used to terminate a statement?',
                options: ['.', ';', ':', ','],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which of the following is an example of an operating system?',
                options: ['MS Word', 'Windows 10', 'Oracle', 'Chrome'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which number system uses only 0 and 1?',
                options: ['Decimal', 'Octal', 'Binary', 'Hexadecimal'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which of these is a primary memory device?',
                options: ['Hard Disk', 'Pen Drive', 'RAM', 'CD-ROM'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which tag is used to display the largest heading in HTML?',
                options: ['<h6>', '<header>', '<h1>', '<title>'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'A student scores 60% in a test of 50 marks. How many marks did the student score?',
                options: ['25', '30', '35', '40'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'What is the next number in the series 2, 6, 12, 20, ?',
                options: ['24', '28', '30', '32'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'A shopkeeper gives a discount of 10% on an item marked Rs. 800. What is the selling price?',
                options: ['Rs. 700', 'Rs. 720', 'Rs. 740', 'Rs. 760'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'If 5 pens cost Rs. 75, what is the cost of 8 pens at the same rate?',
                options: ['Rs. 100', 'Rs. 110', 'Rs. 120', 'Rs. 125'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'In a code language, CAT is written as DBU. How is DOG written?',
                options: ['EPH', 'DPH', 'EOH', 'ENF'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'A shopkeeper marks an item at Rs. 1,200 and offers a discount of 20%. What is the selling price?',
                options: ['Rs. 900', 'Rs. 920', 'Rs. 960', 'Rs. 1,000'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'The sum of two numbers is 60 and their difference is 12. What is the larger number?',
                options: ['24', '30', '36', '48'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'A car travels 150 km in 2.5 hours. What is its average speed?',
                options: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'Find the odd one out: 3, 9, 27, 81, 100.',
                options: ['3', '9', '27', '100'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'In a certain code, NOTE is written as OPUF. How is WORD written in the same code?',
                options: ['XQSE', 'XPSF', 'XPSE', 'XQRF'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
            ],
            medium: [
              {
                text: 'Which data structure is most suitable for implementing recursion?',
                options: ['Queue', 'Array', 'Stack', 'Graph'],
                correctAnswer: 2,
                difficulty: 'medium',
              },
              {
                text: 'Which normal form removes transitive dependency in relational databases?',
                options: ['1NF', '2NF', '3NF', 'BCNF'],
                correctAnswer: 2,
                difficulty: 'medium',
              },
              {
                text: 'Which searching technique checks each element one by one?',
                options: ['Binary search', 'Linear search', 'Interpolation search', 'Hash search'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'In OS, which scheduling algorithm gives the CPU to the process with smallest burst time?',
                options: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which join in SQL returns only matching rows from both tables?',
                options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'],
                correctAnswer: 2,
                difficulty: 'medium',
              },
            ],
            hard: [
              {
                text: 'Which algorithm is used to construct a minimum spanning tree?',
                options: ['Dijkstra’s algorithm', 'Prim’s algorithm', 'Bellman-Ford algorithm', 'Floyd–Warshall algorithm'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which addressing mode uses a base register plus an offset?',
                options: ['Immediate', 'Direct', 'Indexed', 'Register'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'In DBMS, which isolation level avoids dirty reads but may allow phantom reads?',
                options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which traversal of a binary search tree gives elements in sorted order?',
                options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'Which technique is used in compilers to detect lexical errors?',
                options: ['Parser', 'Lexer', 'Intermediate code generator', 'Optimizer'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
            ],
          },

          'M.Sc CS (Web technologies)': {
            easy: [
              {
                text: 'Which HTML tag is used to create a hyperlink?',
                options: ['<link>', '<a>', '<href>', '<url>'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which CSS property is used to change the text color?',
                options: ['font-color', 'text-style', 'color', 'background-color'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which HTTP method is typically used to retrieve data from a server?',
                options: ['PUT', 'POST', 'GET', 'DELETE'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which JavaScript function is used to log messages to the browser console?',
                options: ['print()', 'console.log()', 'log()', 'alert()'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which tag is used to include JavaScript in HTML?',
                options: ['<style>', '<script>', '<code>', '<js>'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'If the selling price of an item is Rs. 600 and profit is 20%, what is the cost price?',
                options: ['Rs. 400', 'Rs. 450', 'Rs. 480', 'Rs. 500'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'Find the odd one out in the series: 3, 9, 27, 81, 100.',
                options: ['3', '9', '27', '100'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'If a car travels 150 km in 3 hours, what is its average speed?',
                options: ['40 km/h', '45 km/h', '50 km/h', '60 km/h'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'What is the next term in the series: 4, 9, 16, 25, ?',
                options: ['30', '32', '36', '49'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'A clock shows 3:15. What is the angle between the hour and minute hand?',
                options: ['7.5°', '15°', '30°', '37.5°'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'The average of 5 numbers is 26. If one of the numbers is 36, what is the average of the remaining 4?',
                options: ['22', '23.5', '24', '25'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'If 3 notebooks cost Rs. 90, how much will 5 notebooks cost at the same rate?',
                options: ['Rs. 120', 'Rs. 130', 'Rs. 140', 'Rs. 150'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'A person walks 5 km north and then 3 km east. What is the shortest distance from the starting point?',
                options: ['4 km', '5 km', '√34 km', '7 km'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
            ],
            medium: [
              {
                text: 'Which HTTP status code indicates a successful request?',
                options: ['200', '301', '404', '500'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
              {
                text: 'Which of the following is a JavaScript framework for building user interfaces?',
                options: ['Django', 'React', 'Laravel', 'Spring'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'In REST, which HTTP method is commonly used to completely replace a resource?',
                options: ['PATCH', 'PUT', 'GET', 'OPTIONS'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which attribute is used in HTML forms to send data using the POST method?',
                options: ['type="post"', 'method="post"', 'action="post"', 'target="post"'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which CSS layout module is best suited for creating two-dimensional grid layouts?',
                options: ['Flexbox', 'Grid', 'Float', 'Box'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
            ],
            hard: [
              {
                text: 'Which header is used in HTTP to enable Cross-Origin Resource Sharing (CORS)?',
                options: ['Access-Control-Allow-Origin', 'Content-Type', 'Cache-Control', 'Accept-Encoding'],
                correctAnswer: 0,
                difficulty: 'hard',
              },
              {
                text: 'Which design pattern is commonly used for state management in React applications?',
                options: ['Singleton', 'Observer', 'Factory', 'Proxy'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which protocol is primarily used for real-time communication in web applications?',
                options: ['HTTP', 'FTP', 'WebSocket', 'SMTP'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'In OAuth 2.0, which grant type is recommended for single-page applications?',
                options: ['Client Credentials', 'Password', 'Authorization Code with PKCE', 'Implicit'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'Which database pattern is commonly used for storing user sessions in distributed systems?',
                options: ['Star schema', 'Snowflake schema', 'Key-value store', 'Document store'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
            ],
          },

          'M.Sc CS (AI & ML)': {
            easy: [
              {
                text: 'Which of the following is an example of supervised learning?',
                options: ['K-Means', 'Linear Regression', 'Apriori', 'Kohonen Network'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which term describes a table of features used to train a model?',
                options: ['Dataset', 'Compiler', 'Protocol', 'Hypervisor'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'Which library is widely used for machine learning in Python?',
                options: ['NumPy', 'Pandas', 'scikit-learn', 'Flask'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which activation function outputs values between 0 and 1?',
                options: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which metric is commonly used to evaluate classification models?',
                options: ['MSE', 'Accuracy', 'MAE', 'RMSE'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'If the ratio of boys to girls in a class is 3:2 and there are 30 students, how many boys are there?',
                options: ['12', '15', '18', '20'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'In a sequence, each term is obtained by adding 5 to the previous term. If the first term is 7, what is the 4th term?',
                options: ['17', '19', '20', '22'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'A person walks 3 km north and then 4 km east. What is the shortest distance from the starting point?',
                options: ['3 km', '4 km', '5 km', '7 km'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'If 12 workers can complete a task in 10 days, in how many days can 6 workers complete the same task (assuming equal efficiency)?',
                options: ['10 days', '15 days', '20 days', '25 days'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'What is the missing number in the series: 5, 11, 17, 23, ?',
                options: ['27', '28', '29', '30'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
            ],
            medium: [
              {
                text: 'Which algorithm is used for dimensionality reduction?',
                options: ['PCA', 'KNN', 'Naive Bayes', 'Decision Tree'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
              {
                text: 'Which method is used to prevent overfitting in decision trees?',
                options: ['Gradient boosting', 'Pruning', 'Bagging', 'Normalization'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which of the following is a loss function for binary classification?',
                options: ['Cross-entropy', 'Hinge loss', 'Huber loss', 'All of these'],
                correctAnswer: 3,
                difficulty: 'medium',
              },
              {
                text: 'Which algorithm is typically used for clustering?',
                options: ['K-Means', 'Logistic Regression', 'SVM', 'Random Forest'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
              {
                text: 'Which evaluation metric is suitable for imbalanced datasets?',
                options: ['Accuracy', 'Precision-Recall', 'MSE', 'R² score'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
            ],
            hard: [
              {
                text: 'Which algorithm is commonly used for training deep neural networks?',
                options: ['Gradient Descent', 'Apriori', 'PageRank', 'Kruskal'],
                correctAnswer: 0,
                difficulty: 'hard',
              },
              {
                text: 'Which regularization technique adds the absolute value of coefficients to the loss?',
                options: ['L1', 'L2', 'Dropout', 'Batch Normalization'],
                correctAnswer: 0,
                difficulty: 'hard',
              },
              {
                text: 'Which reinforcement learning method learns a value function for state-action pairs?',
                options: ['K-Means', 'Q-Learning', 'PCA', 'LDA'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which concept refers to the difference between training error and test error?',
                options: ['Bias', 'Variance', 'Generalization gap', 'Entropy'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'Which type of neural network is best suited for sequential data?',
                options: ['CNN', 'RNN', 'GAN', 'Autoencoder'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
            ],
          },

          MCA: {
            easy: [
              {
                text: 'Which language is primarily used for Android app development?',
                options: ['Java', 'PHP', 'Ruby', 'Swift'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'Which of the following is a relational database management system?',
                options: ['MongoDB', 'MySQL', 'Redis', 'Neo4j'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which keyword in Java is used to inherit a class?',
                options: ['this', 'super', 'extends', 'implements'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which of these is not a programming language?',
                options: ['Python', 'HTML', 'C++', 'Java'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which of the following is used for version control?',
                options: ['Git', 'Docker', 'Jenkins', 'NPM'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'A sum of Rs. 5000 is deposited at simple interest of 10% per annum. What will be the interest after 2 years?',
                options: ['Rs. 500', 'Rs. 750', 'Rs. 1000', 'Rs. 1200'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Find the missing term in the series: A, C, F, J, O, ?',
                options: ['S', 'T', 'U', 'V'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'If the perimeter of a square is 40 cm, what is the length of each side?',
                options: ['5 cm', '8 cm', '10 cm', '12 cm'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Two numbers have an average of 30. If one number is 24, what is the other?',
                options: ['30', '32', '34', '36'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'How many degrees are there in the sum of the interior angles of a triangle?',
                options: ['90°', '120°', '180°', '360°'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'If the perimeter of a rectangle is 40 cm and its length is 12 cm, what is its breadth?',
                options: ['4 cm', '6 cm', '8 cm', '10 cm'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Two numbers have an average of 30. If one number is 24, what is the other?',
                options: ['30', '32', '34', '36'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'A train travels 180 km in 3 hours. What is its average speed?',
                options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
            ],
            medium: [
              {
                text: 'Which software development model follows iterative development and customer feedback?',
                options: ['Waterfall', 'Spiral', 'Prototype', 'Agile'],
                correctAnswer: 3,
                difficulty: 'medium',
              },
              {
                text: 'Which of the following is not a non-functional requirement?',
                options: ['Usability', 'Reliability', 'Performance', 'Algorithm'],
                correctAnswer: 3,
                difficulty: 'medium',
              },
              {
                text: 'Which diagram in UML shows the dynamic behavior of a system?',
                options: ['Class diagram', 'Sequence diagram', 'Component diagram', 'Deployment diagram'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which of the following testing is done without executing the code?',
                options: ['Unit testing', 'Static testing', 'Integration testing', 'System testing'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which metric is used to measure software complexity?',
                options: ['Cyclomatic complexity', 'Latency', 'Throughput', 'Reliability'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
            ],
            hard: [
              {
                text: 'Which architectural style organizes software as a collection of loosely coupled services?',
                options: ['Monolith', 'Layered', 'Microservices', 'Client-Server'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'Which scheduling algorithm is best suited for real-time systems?',
                options: ['FCFS', 'SJF', 'Round Robin', 'Rate Monotonic Scheduling'],
                correctAnswer: 3,
                difficulty: 'hard',
              },
              {
                text: 'Which design principle suggests that modules should be highly cohesive and loosely coupled?',
                options: ['DRY', 'KISS', 'SOLID', 'YAGNI'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
              {
                text: 'Which database transaction property ensures that the database remains in a valid state before and after the transaction?',
                options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which protocol is widely used for secure remote login?',
                options: ['Telnet', 'SSH', 'FTP', 'HTTP'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
            ],
          },

          'M.Sc AI & ML': {
            easy: [
              {
                text: 'Which of the following is a popular deep learning framework?',
                options: ['TensorFlow', 'Django', 'Flask', 'Vue.js'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'Which plot is commonly used to visualize the performance of a classifier?',
                options: ['ROC curve', 'Bar chart', 'Pie chart', 'Box plot'],
                correctAnswer: 0,
                difficulty: 'easy',
              },
              {
                text: 'Which of these is an unsupervised learning task?',
                options: ['Classification', 'Regression', 'Clustering', 'Forecasting'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which layer in a neural network is responsible for extracting features?',
                options: ['Input layer', 'Hidden layer', 'Output layer', 'Dropout layer'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'Which term refers to the number of times the learning algorithm works through the entire training dataset?',
                options: ['Batch size', 'Epoch', 'Iteration', 'Step'],
                correctAnswer: 1,
                difficulty: 'easy',
              },
              {
                text: 'A train travels 120 km in 2 hours. What is its average speed?',
                options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'Which figure comes next in a pattern where each shape rotates 90 degrees clockwise in every step?',
                options: ['Original position', '90° rotated', '180° rotated', '270° rotated'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
              {
                text: 'If the simple interest on Rs. 2000 at 5% per annum for 3 years is:',
                options: ['Rs. 200', 'Rs. 250', 'Rs. 300', 'Rs. 350'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'What is the next number in the series: 1, 4, 9, 16, ?',
                options: ['20', '24', '25', '30'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'In a class of 40 students, 60% are boys. How many girls are there?',
                options: ['12', '14', '16', '18'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'A sum of Rs. 5,000 at 8% simple interest per annum for 2 years earns how much interest?',
                options: ['Rs. 400', 'Rs. 600', 'Rs. 800', 'Rs. 1,000'],
                correctAnswer: 2,
                difficulty: 'easy',
              },
              {
                text: 'What is the next number in the series: 7, 14, 21, 28, ?',
                options: ['30', '32', '34', '35'],
                correctAnswer: 3,
                difficulty: 'easy',
              },
            ],
            medium: [
              {
                text: 'Which optimization algorithm adapts the learning rate for each parameter?',
                options: ['SGD', 'Adam', 'Momentum', 'Adagrad'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which technique randomly drops units during training to prevent overfitting?',
                options: ['Batch Normalization', 'Dropout', 'Pooling', 'Regularization'],
                correctAnswer: 1,
                difficulty: 'medium',
              },
              {
                text: 'Which term refers to the process of using a pre-trained model on a new task?',
                options: ['Fine-tuning', 'Regularization', 'Augmentation', 'Normalization'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
              {
                text: 'Which loss function is commonly used for multi-class classification?',
                options: ['Mean Squared Error', 'Binary Cross-Entropy', 'Categorical Cross-Entropy', 'Huber Loss'],
                correctAnswer: 2,
                difficulty: 'medium',
              },
              {
                text: 'Which dimensionality reduction technique preserves pairwise distances as much as possible?',
                options: ['t-SNE', 'PCA', 'LDA', 'K-Means'],
                correctAnswer: 0,
                difficulty: 'medium',
              },
            ],
            hard: [
              {
                text: 'Which type of neural network is best suited for image recognition tasks?',
                options: ['RNN', 'CNN', 'GAN', 'RBF'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which concept in reinforcement learning balances exploration and exploitation?',
                options: ['Reward', 'Discount factor', 'Policy', 'Epsilon-greedy strategy'],
                correctAnswer: 3,
                difficulty: 'hard',
              },
              {
                text: 'Which technique is used to generate new data samples that resemble the training data?',
                options: ['Autoencoders', 'GANs', 'K-Means', 'SVM'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which matrix is used to evaluate a classification model by comparing predicted and actual labels?',
                options: ['Covariance matrix', 'Confusion matrix', 'Transition matrix', 'Adjacency matrix'],
                correctAnswer: 1,
                difficulty: 'hard',
              },
              {
                text: 'Which learning paradigm uses both labeled and unlabeled data?',
                options: ['Supervised learning', 'Unsupervised learning', 'Semi-supervised learning', 'Reinforcement learning'],
                correctAnswer: 2,
                difficulty: 'hard',
              },
            ],
          },
        };

        const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
        const bankKeyMap = {
          bsccs: 'B.Sc CS',
          'msccs(webtechnologies)': 'M.Sc CS (Web technologies)',
          'msccomputerscience(webtechnologiestrack)': 'M.Sc CS (Web technologies)',
          'msccs(ai&ml)': 'M.Sc CS (AI & ML)',
          mca: 'MCA',
          'mscai&ml': 'M.Sc AI & ML',
          'msc(ai&ml)': 'M.Sc AI & ML',
        };

        const bankKey = bankKeyMap[normalizedName] || name;

        const courseQuestions = questionBank[bankKey];

        if (courseQuestions) {
          const samplesToUse = [
            ...courseQuestions.easy,
            ...courseQuestions.medium,
            ...courseQuestions.hard,
          ];

          const existingTexts = new Set(questions.map((q) => q.text));

          const docsToInsert = samplesToUse
            .filter((q) => !existingTexts.has(q.text))
            .map((q) => ({
              course: course._id,
              text: q.text,
              options: q.options,
              correctAnswer: q.correctAnswer,
              difficulty: q.difficulty,
            }));

          if (docsToInsert.length) {
            await Question.insertMany(docsToInsert);
            questions = await Question.find({ course: courseId }).sort('createdAt');
          }
        }
    }

    let query = { course: courseId };

    // Default: work with questions for this specific course
    let allQuestions = await Question.find(query).sort('createdAt');

    // If admin requested a specific difficulty, return all questions of that difficulty for this course
    if (difficulty) {
      const difficultyFiltered = allQuestions.filter((q) => q.difficulty === difficulty);
      return res.json(difficultyFiltered);
    }

    // For student aptitude practice we want a common pool shared across all courses
    if (type === 'aptitude') {
      const globalAptitude = await Question.find({ difficulty: 'easy' }).sort('createdAt');

      const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };

      const shuffledGlobalAptitude = shuffleArray(globalAptitude);
      return res.json(shuffledGlobalAptitude.slice(0, 20));
    }

    // Separate aptitude (easy) and technical (medium/hard) for this course
    const aptitudePool = allQuestions.filter((q) => q.difficulty === 'easy');
    const technicalPool = allQuestions.filter((q) => q.difficulty === 'medium' || q.difficulty === 'hard');

    // Helper to shuffle an array (Fisher-Yates)
    const shuffleArray = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const shuffledAptitude = shuffleArray(aptitudePool);
    const shuffledTechnical = shuffleArray(technicalPool);

    // If a specific practice type is requested (student side), return up to 20 strictly from the technical pool
    if (type === 'technical') {
      return res.json(shuffledTechnical.slice(0, 20));
    }

    // Default behaviour: mixed set of aptitude + technical (up to 20 questions total)
    let selectedAptitude = shuffledAptitude.slice(0, 10);
    let selectedTechnical = shuffledTechnical.slice(0, 10);

    // If there are not enough aptitude questions, fill from technical pool
    if (selectedAptitude.length < 10) {
      const need = 10 - selectedAptitude.length;
      const extra = shuffledTechnical.filter((q) => !selectedTechnical.includes(q)).slice(0, need);
      selectedAptitude = [...selectedAptitude, ...extra];
    }

    // If there are not enough technical questions, fill from aptitude pool
    if (selectedTechnical.length < 10) {
      const need = 10 - selectedTechnical.length;
      const extra = shuffledAptitude.filter((q) => !selectedAptitude.includes(q)).slice(0, need);
      selectedTechnical = [...selectedTechnical, ...extra];
    }

    let combined = [...selectedAptitude, ...selectedTechnical];

    // Ensure no duplicates and limit to 20
    const seen = new Set();
    combined = combined
      .filter((q) => {
        const id = q._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 20);

    const finalShuffled = shuffleArray(combined);

    res.json(finalShuffled);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { course, text, options, correctAnswer, difficulty } = req.body;

    if (!course || !text || !options || typeof correctAnswer !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const question = await Question.create({ course, text, options, correctAnswer, difficulty });
    res.status(201).json(question);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctAnswer, difficulty, course } = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      { text, options, correctAnswer, difficulty, course },
      { new: true }
    );

    if (!question) return res.status(404).json({ error: 'Question not found' });

    res.json(question);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Attempts
exports.createAttempt = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId, answers } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!courseId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid attempt payload' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    const processedAnswers = answers.map((a) => {
      const q = questionMap.get(a.questionId);
      const isCorrect = q && q.correctAnswer === a.selectedOption;
      if (isCorrect) correctCount += 1;
      return {
        question: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect,
      };
    });

    const totalQuestions = processedAnswers.length;
    const wrongCount = totalQuestions - correctCount;
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const attempt = await UserAttempt.create({
      user: userId,
      course: courseId,
      answers: processedAnswers,
      totalQuestions,
      correctCount,
      wrongCount,
      scorePercentage,
    });

    res.status(201).json(attempt);
  } catch (err) {
    console.error('Error creating attempt:', err);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
};

exports.getUserScoreForCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const attempts = await UserAttempt.find({ course: courseId, user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ error: 'No attempts found for this course and user' });
    }

    const mapped = attempts.map((a) => ({
      totalQuestions: a.totalQuestions,
      correctCount: a.correctCount,
      wrongCount: a.wrongCount,
      scorePercentage: a.scorePercentage,
      createdAt: a.createdAt,
      id: a._id,
    }));

    res.json({ attempts: mapped });
  } catch (err) {
    console.error('Error fetching user score:', err);
    res.status(500).json({ error: 'Failed to fetch score' });
  }
};
