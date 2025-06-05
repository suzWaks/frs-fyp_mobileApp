
# frs-fyp_mobileApp 📱

This repository contains the mobile application frontend of the CST Attendance Management System using Facial Recognition — built using Expo and React Native.

## Overview

The `frs-fyp_mobileApp` is the mobile application that allows students to mark attendance using facial recognition and geofencing, and allows tutors and admins to manage attendance sessions in real-time.

## Features

- Attendance marking using facial recognition
- Real-time tracking of active sessions via SignalR
- Attendance history and reporting
- Role-based navigation (Student, Tutor, Admin, DAA, PL)
- Integration with backend REST APIs

## Technologies Used

- **Framework**: React Native (via Expo)
- **Language**: TypeScript
- **Routing**: Expo Router
- **Real-time**: SignalR Client
- **Styling**: TailwindCSS and Native wind


## Installation
Skip step 1 if you are using .zip file
1. Clone the repository:
   ```bash
   git clone https://github.com/suzWaks/frs-fyp_mobileApp.git
   ```

2. Navigate to the project directory:
   ```bash
   cd frs-fyp_mobileApp
   ```

3. Get your ip address and change it in `app.json`:
   ```bash
      "API_BASE_URL": "http://{your_ip}:5253/api",
      "API_MODEL_URL": "http://{your_ip}:5000"
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Run Face Recognition Model

Before starting the mobile app, run the face recognition server:

```bash
cd assets/model
python app.py
```

This will start the Python-based ML server that performs facial recognition.

### Run the Mobile App

1. Start the app:
   ```bash
   npx expo start
   ```

2. From the output, you can open the app using:
   - **Expo Go** on your mobile device
   - **Android Emulator** or **iOS Simulator**

## Contact

- **Name**: Suzal Wakhley
- **Email**: suzalwakhley@gmail.com
- **GitHub**: [suzWaks](https://github.com/suzWaks)
