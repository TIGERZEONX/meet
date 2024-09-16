const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerIdElement = document.getElementById('peer-id');
const remotePeerIdInput = document.getElementById('remotePeerId');
const connectButton = document.getElementById('connectButton');
const emojiBtn = document.getElementById('emojiBtn');
const chatBtn = document.getElementById('chatBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');
const emojiPicker = document.getElementById('emojiPicker');

let localStream;
let peer;
let call;
let conn;

// Get user media (video and audio)
async function getMediaStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        console.log("Local stream initialized.");
    } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access your camera or microphone. Please check permissions and try again.");
    }
}

// Initialize PeerJS and display the Peer ID (meeting ID)
function setupPeer() {
    peer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

    peer.on('open', (id) => {
        console.log(`My Peer ID is: ${id}`);
        peerIdElement.textContent = `Your Peer ID (Meeting ID): ${id}`;
    });

    peer.on('error', (err) => {
        console.error("PeerJS error:", err);
        alert("An error occurred with PeerJS. Please try refreshing the page.");
    });

    peer.on('call', (incomingCall) => {
        incomingCall.answer(localStream);
        incomingCall.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    });

    // Handle incoming connections (for chat or emoji)
    peer.on('connection', (connection) => {
        conn = connection;
        conn.on('data', handleIncomingData);
    });
}

// Connect to another peer using their Peer ID
connectButton.addEventListener('click', () => {
    const remotePeerId = remotePeerIdInput.value.trim();

    if (remotePeerId && localStream) {
        call = peer.call(remotePeerId, localStream);
        conn = peer.connect(remotePeerId); // Create a connection for chat/emoji
        conn.on('data', handleIncomingData); // Handle incoming chat/emoji data

        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    } else {
        alert("Please enter a valid Peer ID and ensure your media devices are initialized.");
    }
});

// Handle incoming chat messages or emojis
function handleIncomingData(data) {
    if (typeof data === 'string') {
        const message = document.createElement('p');
        message.textContent = data;
        chatMessages.appendChild(message);
    }
}

// Send chat messages
sendChatBtn.addEventListener('click', () => {
    const message = chatInput.value;
    if (message && conn) {
        conn.send(message);
        chatMessages.innerHTML += `<p>You: ${message}</p>`;
        chatInput.value = '';
    }
});

// Show/hide emoji picker
emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// Send emoji by clicking on any emoji in the picker
emojiPicker.addEventListener('click', (event) => {
    const emoji = event.target.textContent;
    if (emoji && conn) {
        conn.send(emoji);
        chatMessages.innerHTML += `<p>You: ${emoji}</p>`;
    }
});

// Initialize the local media stream and set up the peer connection
getMediaStream();
setupPeer();
