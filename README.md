# UnboxedU

## Overview
UnboxedU is a gamified study productivity mobile application designed to motivate students through rewards and collectible blind boxes. By combining productivity tools with engaging reward mechanics, the app encourages students to build consistent study habits while making learning more enjoyable.

Users can complete study tasks to earn coins, which can then be used to open blind boxes containing collectible characters of different rarity levels.

---

## Problem Statement

Many students struggle with:
- Lack of motivation to study consistently
- Existing productivity apps feeling repetitive and boring
- Difficulty maintaining long-term study habits

UnboxedU aims to solve this problem by introducing gamification elements into task management and study productivity.

---

## Features

### Task Manager
- Create and manage study tasks
- Track task completion
- Organize daily productivity goals

### Coin Reward System
- Earn coins after completing tasks
- Incentivizes productivity and consistency

### Blind Box Opening
- Spend coins to open mystery blind boxes
- Randomized collectible rewards with rarity tiers

### Collection Gallery
- Store unlocked collectibles
- Track collection progress

### Authentication System
- User registration and login
- Persistent user data using Firebase Authentication

---

# System Architecture

## Frontend
- React Native
- Expo Router
- TypeScript

## Backend
- Firebase Authentication
- Firebase Firestore

## Optional Backend Extensions
- Spring Boot REST API
- Node.js services

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| React Native | Mobile application development |
| Expo | React Native framework |
| Expo Router | Navigation and routing |
| Firebase Auth | User authentication |
| Firestore | Cloud database |
| TypeScript | Type-safe development |
| Spring Boot | Backend REST API |
| GitHub | Version control |
| Postman | API testing |

---

# User Journey

1. User opens the app
2. User registers or logs in
3. User accesses dashboard
4. User creates and completes tasks
5. User earns coins
6. User opens blind boxes
7. User collects characters in gallery

---

# Technical Proof of Concept

The current prototype includes:
- Integrated frontend and backend
- Firebase Authentication
- User login and registration
- Firestore database integration
- Task management interface
- Reward and collection system prototype

---

# Evaluation

The project has been tested for:
- Authentication flow
- Firestore database connectivity
- REST API endpoints using Postman
- Randomized blind box reward generation
- Persistent user data storage

---

# Future Improvements

- Seasonal and limited-edition blind boxes
- AI-powered study recommendations
- Leaderboards and achievements
- Friend system and social sharing
- Personalized analytics dashboard
- Study streak tracking

---

# Installation

## Prerequisites
- Node.js 20 LTS
- Expo Go mobile app
- Git

---

## Clone Repository

```bash
git clone https://github.com/yourusername/UnboxedU.git
cd UnboxedU
```

---

## Install Dependencies

```bash
npm install --legacy-peer-deps
```

---

## Start Development Server

```bash
npx expo start
```

---

# Team Members

- Chua Jinghao
- Han Zhong Ding

---

# Repository Structure

```text
app/
components/
constants/
hooks/
assets/
scripts/
```

---

# License

This project is developed for educational purposes as part of a software engineering project milestone.
