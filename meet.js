const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerIdElement = document.getElementById('peer-id');
const remotePeerIdInput = document.getElementById('remotePeerId');
const connectButton = document.getElementById('connectButton');

let localStream;
let peer;
let call;

// Get user media (video and audio)
async function getMediaStream() {
    try {
        // Request video and audio from the user's devices
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Display the local stream in the local video element
        localVideo.srcObject = localStream;
        console.log("Local stream initialized.");

    } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access your camera or microphone. Please check permissions and try again.");
    }
}

// Initialize PeerJS and display the Peer ID (meeting ID)
function setupPeer() {
    // Create a new Peer instance
    peer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

    // Display the Peer ID once the peer connection is open
    peer.on('open', (id) => {
        console.log(`My Peer ID is: ${id}`);
        peerIdElement.textContent = `Your Peer ID (Meeting ID): ${id}`;
    });

    peer.on('error', (err) => {
        console.error("PeerJS error:", err);
        alert("An error occurred with PeerJS. Please try refreshing the page.");
    });

    // Answer incoming calls and display the remote stream
    peer.on('call', (incomingCall) => {
        console.log("Incoming call from:", incomingCall.peer);

        // Answer the call with the local stream (video/audio)
        incomingCall.answer(localStream);

        // When the remote stream is received, display it in the remote video element
        incomingCall.on('stream', (remoteStream) => {
            console.log("Received remote stream");
            remoteVideo.srcObject = remoteStream;
        });

        incomingCall.on('error', (err) => {
            console.error("Call error:", err);
        });
    });
}

// Connect to another peer using their Peer ID
connectButton.addEventListener('click', () => {
    const remotePeerId = remotePeerIdInput.value.trim();

    if (remotePeerId && localStream) {
        // Initiate a call to the remote peer
        call = peer.call(remotePeerId, localStream);
        console.log(`Calling peer with ID: ${remotePeerId}`);

        // When the remote stream is received, display it in the remote video element
        call.on('stream', (remoteStream) => {
            console.log("Connected to remote peer, displaying stream.");
            remoteVideo.srcObject = remoteStream;
        });

        call.on('error', (err) => {
            console.error("Call error:", err);
        });
    } else {
        alert("Please enter a valid Peer ID and ensure your media devices are initialized.");
    }
});

// Initialize the local media stream and set up the peer connection
getMediaStream();
setupPeer();
