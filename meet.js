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
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        console.log("Local stream initialized.");
    } catch (error) {
        console.error("Error accessing media devices.", error);
        alert("Could not access your camera or microphone. Please check permissions.");
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

    peer.on('call', (incomingCall) => {
        console.log("Incoming call from: ", incomingCall.peer);
        incomingCall.answer(localStream);
        incomingCall.on('stream', (remoteStream) => {
            console.log("Received remote stream");
            remoteVideo.srcObject = remoteStream;
        });
    });
}

// Connect to another peer
connectButton.addEventListener('click', () => {
    const remotePeerId = remotePeerIdInput.value;

    if (remotePeerId && localStream) {
        call = peer.call(remotePeerId, localStream);

        call.on('stream', (remoteStream) => {
            console.log("Connected to remote peer");
            remoteVideo.srcObject = remoteStream;
        });

        call.on('error', (err) => {
            console.error("Call error:", err);
        });
    } else {
        alert("Please enter a valid Peer ID and ensure your media devices are initialized.");
    }
});

// Start the process
getMediaStream();
setupPeer();
