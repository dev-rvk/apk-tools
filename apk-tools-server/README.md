# APK Analysis API

A TypeScript Express server that analyzes Android APK files using different security analysis tools.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Docker

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Pull the Docker Images

Pull the appropriate images based on your system architecture:

For ARM64 systems:
```bash
docker pull devrvk/reconizerx-docker:arm64
docker pull devrvk/secureapk:arm64
```

For AMD64 systems:
```bash
docker pull devrvk/reconizerx-docker:amd64
docker pull devrvk/secureapk:amd64
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Server

```bash
npm start
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### 1. POST /api/reconizex

Analyzes an APK file using the ReconizeX Docker container.

#### Request

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `apk`: The APK file to analyze (required)

#### Example Request

Using cURL:

```bash
curl -X POST http://localhost:3000/api/reconizex \
  -F "apk=@/path/to/your-app.apk"
```

#### Response

A successful response will have a 200 status code and include:

```json
{
  "filename": "example.apk",
  "results": "Contents of non-info.txt from the analysis results"
}
```

### 2. POST /api/secureapk

Analyzes an APK file using the SecureApk Docker container.

#### Request

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `apk`: The APK file to analyze (required)

#### Example Request

Using cURL:

```bash
curl -X POST http://localhost:3000/api/secureapk \
  -F "apk=@/path/to/your-app.apk"
```

#### Response

A successful response will have a 200 status code and include:

```json
{
  "filename": "example.apk",
  "results": "Contents of vulnerabilities.txt from the analysis results"
}
```

## Testing with Postman

1. Open Postman and create a new request
2. Set the request method to POST
3. Enter the URL: `http://localhost:3000/api/reconizex` or `http://localhost:3000/api/secureapk`
4. Go to the Body tab and select "form-data"
5. Add a key named "apk", change the type to "File" using the dropdown on the right
6. Click "Select Files" and choose an APK file
7. Click "Send" to submit the request
8. View the JSON response with the analysis results

## Error Responses

Both endpoints return similar error responses:

- `400 Bad Request`: Invalid input (missing APK file or wrong file type)
- `500 Internal Server Error`: Error during analysis or reading results

## Directory Structure

```
├── dist/                   # Compiled JavaScript files
├── src/
│   └── index.ts            # Main server file
├── tools/
│   ├── reconizex/
│   │   ├── input/          # ReconizeX APK files for analysis
│   │   └── output/         # ReconizeX analysis results
│   └── secureapk/
│       ├── input/          # SecureApk APK files for analysis
│       └── output/         # SecureApk analysis results
├── package.json
├── tsconfig.json
└── README.md
```

## Development

To run the server in development mode with live reloading:

```bash
npm run dev
```