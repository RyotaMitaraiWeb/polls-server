# Polls Server
Server application for polls application, written in NestJS.

## Installation
```npm
npm install
```

This project uses PostgreSQL for its production database. After installing Postgres and initializing a Postgres server successfully, head over to `/src/app.module.ts` and make adjustments to the database configurations as needed. You can create a file called `variables.env` in the `src` folder to insert your DB server's configurations there. Note that the default settings may not necessarily work with a standard installation of PostgreSQL, so make sure to double check.

After doing the above, run
```npm
npm run start:dev
```
If the terminal doesn't show any errors, then the server is running successfully.

## Running tests
This project consists mostly of end-to-end tests (with a couple of unit tests here and there). All those tests run on SQLite in the memory of the application. No additional installations are required to run them.

To run the tests, run
```npm
npm run test
```
And then wait for the test results.

## App structure and files
### ```app.module.ts```
Hosts the production database's configurations, JWT options, and `.env` settings. This is also where you import every module you create.

### ```interfaces.ts```
This file contains all interfaces created for the purposes of this object. Some of those are used exclusively in the unit/end-to-end tests.

### ```test-db.ts```
Hosts the test database's configurations.

### ```main.ts```
File that bootstraps (starts) the application.

### ```user```
Contains services, controllers, entities, tests, and DTOs for all functionalities related to registering, logging in, logging out, and finding users.

#### Creating a user
To create (register) a user, send a POST request to ``/user/register`` with the following JSON:
```json
{
  "username": string,
  "password": string
}
```
The username has to be between 5 and 15 characters and not already taken, while the password has to be at least 6 characters. Once validations pass, the password will be hashed, the user will be created, an access token will be generated, and the server will also return the user's id and username to be kept by the client.

#### Logging in a user
To log in a user, send a POST request to ``/user/login`` with the same JSON as the above. A successful login yields the same response as a successful register.

#### Checking for login status
To check if a user is logged in or not, send a POST request to ``/user/isLogged`` with a token attached to the ``Authorization`` header. If the token is valid (aka it's not blacklisted and is verified by the JWT service), the server will respond with the user's username and id, otherwise, it will return a rejecting response.

#### Logging out a user
To log out a user, send a DELETE request to ``/user/logout`` with their token attached to the ``Authorization`` header. The token is then blacklisted, meaning that it cannot be used in future authorized requests.

### ```poll```
Contains services, controllers, entities, tests, and DTOs for all functionalities related to reading, creating, editing, deleting, and voting on polls. This directory contains two entities: ``Poll`` and ``PollPreviousTitle``, the latter of which is used to track a poll's previous titles throughout edits.

#### Creating a poll
To create a poll, send a POST request to ```/poll/create``` with the following JSON:
```json
{
  "title": string,
  "description": string,
  "choices": string[]
}
```
and supply the ``Authorization`` header with a valid JWT token.

``title`` must be between 5 and 100 characters. ``description`` is optional, but cannot be more than 500 characters. ``choices`` must contain at least two options (there is no limit to the numbers of choices as of yet), each of which must be between 1 and 50 characters. In addition, the array should contain no duplicates.

#### Getting a poll
To get a poll, send a GET request to ```poll/:id``` where :id is an integer. To get an array of all polls, send a GET request to ```poll/all```. If you want to get all polls whose title contains a given string, send a GET request to ```poll?search=query``` where ``query`` is the string to be searched.

#### Editing a poll
Currently, it is possible to edit only the title. To edit the title, send a PATCH request to ``/poll/:id/edit`` where :id is the poll's id with the following JSON:
```json
{
  "title": string
}
```
and supply the ``Authorization`` header with the author's JWT token.

The title follows the same rules as when creating a poll (aka it must be between 5 and 100 characters)

#### Deleting a poll
To delete a poll, send a DELETE request to ```poll/:id/delete``` where ``:id`` is the poll's id. Supply the ``Authorization`` header with the author's JWT token


#### Voting for a poll
To vote for a poll, send a POST request to ```poll/:pollId/vote/:choiceId``` with a valid JWT token.

### ```choice```
Contains services, entities, tests, and DTOs for all functionalities related to creating and validating choice inputs for polls. This module does not have any controllers, the voting is performed by the poll module.

### Middlewares
#### ```CheckIfLogged```
This middleware attaches to the request object information about the user and whether they are logged in or not. This middleware does not authorize requests by itself, but must be combined with other middlewares that rely on it to authorize a request

#### ```VerifyToken```
This middleware authorizes a request if the user is logged in. The request must first go through ``CheckIfLogged``, as this middleware uses the information provided from there to (not) authorize the request

#### ```VerifyLackOfToken```
This middleware authorizes a request if the user is NOT logged in. The request must first go through ``CheckIfLogged``, as this middleware uses the information provided from there to (not) authorize the request. This middleware is mostly used in register and login requests.

#### ```BlacklistToken```
This middleware invalidates a token and makes it unusable for future authorized requests.

#### ```IsAuthor```
This middleware attaches to the request object the requested poll and whether they are the author or not. This middleware does not authorize requests by itself, but must be combined with other middlewares that rely on it to authorize a request.

#### ```IsAuthorized```
This middleware authorizes a request if the user is the creator of the poll.

#### ```HasVoted```
This middleware attaches to the request object whether the user has voted in the poll and, if yes, the choice they voted for. This middleware does not authorize requests by itself, but must be combined with other middlewares that rely on it to authorize a request.

#### ```CanVote```
This middleware authorizes a request if the user has not voted in the poll.

## License
[MIT](https://choosealicense.com/licenses/mit/)