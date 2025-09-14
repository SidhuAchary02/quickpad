# QuickPad
A minimalist, browser-based notepad for quick, secure, and anonymous note-taking.

## Features
- **Instant note creation** - No registration required, start writing immediately
- **Unique URLs** - Each note gets its own shareable link
- **Optional password protection** - Secure your notes with custom passwords
- **Anonymous or authenticated** - Use without signup or create an account for additional features
- **Real-time collaboration** - Multiple users can edit notes simultaneously
- **Clean interface** - Distraction-free writing environment
- **Fast and lightweight** - Optimized for speed and minimal resource usage

## Usage
1. **Create a note** - Visit the homepage and start typing
2. **Share instantly** - Copy the unique URL to share with others
3. **Add protection** - Set a password for sensitive notes
4. **Collaborate** - Share the URL with others for real-time editing
5. **Optional account** - Sign up to manage and organize your notes

## Security
- **Client-side encryption** - Passwords are hashed before transmission
- **No data mining** - We don't track or analyze your content
- **Secure connections** - All data transmitted over HTTPS
- **Anonymous by default** - No personal information required
- **Auto-cleanup** - Notes can be set to expire automatically

## Local Setup
### Prerequisites
- Node.js (v22.19.0 or higher)
- React.js (19.1.10)
- MongoDB database
- Git

### Installation
1. Clone the repository

```
git clone https://github.com/SidhuAchary02/quickpad.git
cd quickpad
```

2. Install server dependencies
```
cd server
npm install
```


3. Install frontend dependencies
```
cd frontend
npm install
```


4. Configure environment variables
```
#server (.env)
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

#Frontend (.env)
VITE_API_URL=http://localhost:5030
VITE_SOCKET_URL=http://localhost:5030
```


5. Start the development servers

server (terminal 1)
```
cd server
npm run dev
```

Frontend (terminal 2)
```
cd frontend
npm run dev
```


6. Open your browser to `http://localhost:5173`

## License
MIT License - see the [LICENSE](LICENSE) file for details.
