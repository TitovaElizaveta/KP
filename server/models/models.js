const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true }, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'teacher', 'student'), allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false, defaultValue: 'student' },
  name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: true },
})

const Group = sequelize.define('group', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
})

const Course = sequelize.define('course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
})

const Theory = sequelize.define('theory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER, allowNull: false },
})

const Test = sequelize.define('test', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  timeLimit: { type: DataTypes.INTEGER }, // in minutes
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
})

const Question = sequelize.define('question', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('single', 'many', 'match', 'write'), allowNull: false },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false },
  points: { type: DataTypes.INTEGER, defaultValue: 1, validate:{min:1}},
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
})

const AnswerOption = sequelize.define('answerOption', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.STRING, allowNull: false },
  isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const MatchPairs = sequelize.define('matchPair', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  leftItems: { type: DataTypes.STRING, allowNull: false },
  rightItems: { type: DataTypes.STRING, allowNull: false },
})

const AnswerWrite = sequelize.define('answerWrite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  correctText: { type: DataTypes.STRING, allowNull: false },
})

//связ табл
const TestAttempt = sequelize.define('testAttempt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  testStart: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
  testEnd: { type: DataTypes.DATE, allowNull:true },
  score: { type: DataTypes.INTEGER,validate:{min:0} },
  grade:{type:DataTypes.INTEGER,allowNull:true,validate:{min:2,max:5}},
  isCompleted:{type:DataTypes.BOOLEAN,defaultValue:false},
  attemptNumber: { type: DataTypes.INTEGER, allowNull: false,defaultValue: 1,validate: {min: 1}},
  timeSpent: { type: DataTypes.INTEGER, allowNull: true, validate: {min: 0}}
})

const StudentAnswer = sequelize.define('studentAnswer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  answerText : { type: DataTypes.TEXT, allowNull: true },
  isCorrect: { type: DataTypes.BOOLEAN, allowNull: true },
  pointsEarned: { type: DataTypes.INTEGER, defaultValue: 0,validate: {min: 0}}
})

const UserGroup = sequelize.define('userGroup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const GroupCourse = sequelize.define('groupCourse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const CourseTest = sequelize.define('courseTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deadline: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  attemptsAllowed: { type: DataTypes.INTEGER, defaultValue: 1 }
})

const TestQuestion = sequelize.define('testQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})


//связи
User.belongsToMany(Group, {through: UserGroup,foreignKey: 'id_student', otherKey: 'id_group'})
Group.belongsToMany(User, {through: UserGroup,foreignKey: 'id_group', otherKey: 'id_student'})

Group.belongsToMany(Course, { through: GroupCourse, foreignKey: 'id_group',  otherKey: 'id_course' })
Course.belongsToMany(Group, { through: GroupCourse, foreignKey: 'id_course', otherKey: 'id_group'})

Course.belongsToMany(Test, { through: CourseTest, foreignKey: 'id_course', otherKey: 'id_test' })
Test.belongsToMany(Course, { through: CourseTest, foreignKey: 'id_test', otherKey: 'id_course'})

Test.belongsToMany(Question, { through: TestQuestion, foreignKey: 'id_test', otherKey: 'id_question' })
Question.belongsToMany(Test, { through: TestQuestion, foreignKey: 'id_question', otherKey:'id_test' })

User.hasMany(Course, {foreignKey: 'id_teacher', as: 'teachercourse' })
Course.belongsTo(User, {foreignKey: 'id_teacher', as: 'teacher' })

Course.hasMany(Theory, {foreignKey: 'id_course', onDelete: 'CASCADE' })
Theory.belongsTo(Course, {foreignKey: 'id_course' })

User.hasMany(Question, {foreignKey: 'createdBy', as: 'createdQuestions' })
Question.belongsTo(User, {foreignKey: 'createdBy', as: 'creater' })

User.hasMany(Test, {foreignKey: 'createdBy', as: 'createdTest' })
Test.belongsTo(User, {foreignKey: 'createdBy', as: 'creater' })

Question.hasMany(AnswerOption, {foreignKey: 'id_question', as:'answerOptions' })
AnswerOption.belongsTo(Question, {foreignKey: 'id_question' })

Question.hasMany(MatchPairs, {foreignKey: 'id_question', as:'matchPairs'})
MatchPairs.belongsTo(Question, {foreignKey: 'id_question' })

Question.hasOne(AnswerWrite, {foreignKey: 'id_question', as:'correctWrite'})
AnswerWrite.belongsTo(Question, {foreignKey: 'id_question' })

User.hasMany(TestAttempt, {foreignKey: 'id_student', as:'attempts' });
TestAttempt.belongsTo(User, { foreignKey: 'id_student', as: 'student' })

Test.hasMany(TestAttempt, {foreignKey: 'id_test'});
TestAttempt.belongsTo(Test, { foreignKey: 'id_test' })

Question.hasMany(StudentAnswer, { foreignKey: 'id_question'});
StudentAnswer.belongsTo(Question, { foreignKey: 'id_question' })

User.hasMany(StudentAnswer, {foreignKey: 'id_student'});
StudentAnswer.belongsTo(User, { foreignKey: 'id_student' })

TestAttempt.hasMany(StudentAnswer, {  foreignKey: 'id_attempt'});
StudentAnswer.belongsTo(TestAttempt, { foreignKey: 'id_attempt' })

module.exports = {
  User,
  Group,
  Course,
  Theory,
  Test,
  Question,
  AnswerOption,
  MatchPairs,
  AnswerWrite,
  TestAttempt,
  StudentAnswer,
  UserGroup,
  GroupCourse,
  CourseTest,
  TestQuestion
}