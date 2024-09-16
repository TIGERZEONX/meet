const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerIdElement = document.getElementById('peer-id');
const remotePeerIdInput = document.getElementById('remotePeerId');
const connectButton = document.getElementById('connectButton');

let localStream;
let peer;
let call;

// Get user media
async function getMediaStream() {
    try {
        // Request both video and audio tracks
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Assign the local stream to the video element
        localVideo.srcObject = localStream;

        console.log("Local stream initialized.");

        // Log video and audio tracks
        localStream.getVideoTracks().forEach(track => {
            console.log("Video track: ", track);
        });
        localStream.getAudioTracks().forEach(track => {
            console.log("Audio track: ", track);
        });

    } catch (error) {
        console.error("Error accessing media devices.", error);
        alert("Could not access your camera or microphone. Please check permissions and try again.");
    }
}

// Setup PeerJS
function setupPeer() {
    peer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

    peer.on('open', (id) => {
        console.log(`My Peer ID is: ${id}`);
        peerIdElement.textContent = `Your Peer ID: ${id}`;
    });

    peer.on('error', (err) => {
        console.error("PeerJS error:", err);
    });

    // Answer incoming calls and display the remote stream
    peer.on('call', (incomingCall) => {
        console.log("Incoming call from: ", incomingCall.peer);

        // Answer the call with your local stream
        incomingCall.answer(localStream);

        // When the remote stream is received, display it
        incomingCall.on('stream', (remoteStream) => {
            console.log("Received remote stream");
            remoteVideo.srcObject = remoteStream;
        });

        incomingCall.on('error', (err) => {
            console.error("Call error: ", err);
        });
    });
}

// Connect to another peer
connectButton.addEventListener('click', () => {
    const remotePeerId = remotePeerIdInput.value.trim();

    if (remotePeerId && localStream) {
        // Initiate a call to the remote peer
        call = peer.call(remotePeerId, localStream);

        call.on('stream', (remoteStream) => {
            console.log("Connected to remote peer, displaying stream.");
            remoteVideo.srcObject = remoteStream;
        });

        call.on('error', (err) => {
            console.error("Call error: ", err);
        });
    } else {
        alert("Please enter a valid Peer ID and ensure your media devices are initialized.");
    }
});

// Initialize media stream and setup PeerJS
getMediaStream();
setupPeer();
