# Our ToDo List - WORK IN PROGRESS

This project consists of a minimalist React Native app where one can manage shared todo-lists in a simple and effective manner. For example, one could have a list named "Household Tasks" that is shared with the people they live with. When any user adds an item to the list, any other user will be able to **claim** that task, notifying others that someone is taking care of the task. Upon completion, they will mark the task as completed and everyone else will be able to see that.

## Technologies Used
[React Native](https://reactnative.dev/)

[TypeScript](https://www.typescriptlang.org/)

[AWS Cognito](https://aws.amazon.com/cognito/)

[AWS DynamoDB](https://aws.amazon.com/dynamodb/)

[AWS S3](https://aws.amazon.com/s3/)

[AWS Lambda](https://aws.amazon.com/lambda/)

[AWS SNS](https://aws.amazon.com/sns/)

[Love](https://time.com/4969114/fda-granola-love/)


## Development Notes

Code readability and maintanability are the main development focus of this project.

You might notice that some of the styling conventions in this project are not standard, and that there are no linter settings. This is deliberate; since it's a personal project, I took the liberty of using conventions that I find much more readable than the standard practices.

On the same subject, I decided not to use any state-management libraries/concepts such as Redux. I have worked with such systems before, and their benefits do not justify the added complexity, development time, and un-readability that they cost, for this project. This was also an opportunity for me to try developing bespoke systems to fulfill these purposes in a manner I find elegant and readable, such as the `App/Navigation.ts` class.

I've also avoided using design libraries, as one of the goals of this project is to practice my front-end design skills.