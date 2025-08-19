import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [document, setDocument] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:5030');
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'init') {
                    setDocument(message.data);
                } else if (message.type === 'update') {
                    setDocument(message.data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            newSocket.close();
        };
    }, []);

    const handleChange = (e) => {
        const newDocument = e.target.value;
        setDocument(newDocument);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'update', data: newDocument }));
        }
    };

    return (
        <div className="App">
            <h1>Collaborative Editor</h1>
            <textarea
                value={document}
                onChange={handleChange}
                rows="20"
                cols="80"
            />
        </div>
    );
}

export default App;