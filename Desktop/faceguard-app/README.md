# FaceGuard Application

FaceGuard is a web application that streams live video from a Raspberry Pi 5 equipped with Camera 3 and implements an AI face recognition system. This project aims to provide real-time video streaming and face recognition capabilities for various applications, including security and monitoring.

## Features

- Live video streaming from Raspberry Pi camera
- AI-powered face recognition
- User-friendly dashboard to monitor video and recognition status

## Project Structure

```
faceguard-app
├── src
│   ├── server
│   │   ├── app.ts                # Entry point for the server application
│   │   ├── routes
│   │   │   └── video.ts          # Routes for video streaming
│   │   ├── controllers
│   │   │   └── faceRecognitionController.ts # Face recognition logic
│   │   └── utils
│   │       └── cameraStream.ts   # Utility for camera streaming
│   ├── client
│   │   ├── components
│   │   │   ├── Dashboard.tsx      # Main dashboard component
│   │   │   ├── VideoStream.tsx    # Component for rendering video stream
│   │   │   └── FaceRecognitionStatus.tsx # Component for recognition status
│   │   ├── pages
│   │   │   └── App.tsx           # Main application component
│   │   └── styles
│   │       └── main.css          # CSS styles for the application
│   └── types
│       └── index.ts              # TypeScript interfaces and types
├── package.json                   # npm configuration file
├── tsconfig.json                  # TypeScript configuration file
└── README.md                      # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/faceguard-app.git
   cd faceguard-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the Raspberry Pi camera and ensure it is properly configured.

## Usage

1. Start the server:
   ```
   npm run start
   ```

2. Open your web browser and navigate to `http://localhost:3000` to access the application.

3. Use the dashboard to start the video stream and monitor face recognition status.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.