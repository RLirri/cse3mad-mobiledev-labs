# Week 06 – SQLite CRUD Application (Expo React Native)

This project demonstrates how to implement a **local SQLite database** in a React Native mobile application using **Expo SQLite**. The app allows users to manage a list of logged users and their login timestamps through full **CRUD (Create, Read, Update, Delete)** operations.

The goal of this lab is to understand how mobile applications can store and manipulate persistent data locally without requiring a remote server.


### Technologies Used

- React Native
- Expo
- Expo SQLite
- TypeScript


### Features

The application supports the following database operations:

#### Create
Insert a new logged user with a username and login timestamp.

#### Read
Display all stored user records from the SQLite database.

#### Update
Modify an existing user's username or login timestamp.

#### Delete
Remove a user record from the database.

#### Additional Controls
- Refresh records
- Search users
- Reset form
- Recreate database table


### Database Schema

The application uses a single SQLite table:

```sql
CREATE TABLE logged_users (
  id INTEGER PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  login_time TEXT NOT NULL
);
```
### How It Works

The app initializes the SQLite database using the SQLiteProvider from Expo SQLite.

On the first run, a migration function creates the database table and inserts sample records.

The UI allows users to perform CRUD operations that execute SQL queries such as:

```sql
INSERT INTO logged_users
SELECT * FROM logged_users
UPDATE logged_users
DELETE FROM logged_users

```

### Installation

Install dependencies:
```
npm install
```
Install SQLite package:

```
npx expo install expo-sqlite
```
Start the development server:
```
npx expo start
```
