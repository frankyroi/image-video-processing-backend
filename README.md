# image-video-processing-backend

This is a Rest API for image and video upload and processing using Express, Typescript, FFmpeg and PostgresQL.

## Install FFmpeg:
on Ubuntu:
```bash
  sudo apt-get install ffmpeg
```

on Mac:
```bash
  brew install ffmpeg
```


## Run Locally

Clone the project

```bash
  git clone https://github.com/frankyroi/image-video-processing-backend.git
```

Go to the project directory
```bash
  cd image-video-processing-backend
```

Install dependencies
```bash
  npm install
```

## Setup

```bash
  cp .env.example .env
```
Update .env file with your postgres database credentials

Create database.
```bash
  npx ts-node src/create-db-schema.ts
```

Create database schema.
```bash
  npx typeorm-ts-node-commonjs migration:run -d ./src/NewDataSource.ts
```



## Available Scripts

Runs the app in the development mode.
```bash
  npm start
```
Start server on [http://localhost:5001]


Runs the test suite
```bash
  npm test
```


## Here is a brief overview of the API endpoints and functionalities:

## 1. Endpoint: POST /api/asset/upload
Description: Uploads PNG or JPEG images and returns an asset Id.
Example: http://localhost:5001/api/asset/upload
Request Body: image (binary data)

## 2. Endpoint: POST /api/asset/resize-and-rotate/:assetId
Description: Resizes and/or rotates an uploaded image based on the specified dimensions and/or angle.
Example: http://localhost:5001/api/asset/resize-and-rotate/2a2a416e-8ba0-48b4-9f49-415953489bea?width=300&height=200&angle=180
Request Body: { width: 300, height: 200, angle: 90 }

## 3. Endpoint: POST /api/asset/uploadVideo
Description: Uploads mp4 videos and returns an asset Id.
Example: http://localhost:5001/api/asset/uploadVideo
Request Body: video (binary data)

## 4. Endpoint: POST /api/asset/addWatermarkToVideo/:assetId
Description: Adds a watermark to an uploaded video and returns a download URL.
Example: http://localhost:5001/api/asset/addWatermarkToVideo/2a2a416e-8ba0-48b4-9f49-41595348900fa

## 5. Endpoint: POST /api/asset/extractAudioFromVideo/:assetId
Description: Extracts sound from an uploaded video and returns a download URL.
Example: /api/asset/extractAudioFromVideo/2a2a416e-8ba0-48b4-9f49-41595348900fa