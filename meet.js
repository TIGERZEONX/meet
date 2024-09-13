const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const muteBtn = document.getElementById('muteBtn');
const stopVideoBtn = document.getElementById('stopVideoBtn');
const leaveBtn = document.getElementById('leaveBtn');

let localStream;
let peer;
let call;

const urlParams = new URLSearchParams(window.location.search);
const meetingId = urlParams.get('meetingId');

// Get video/audio stream
async function getMediaStream() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
}

// Initialize PeerJS and set up event listeners
function setupPeer() {
    peer = new Peer(meetingId, { host: '0.peerjs.com', port: 443, secure: true });

    peer.on('call', (incomingCall) => {
        incomingCall.answer(localStream);
        incomingCall.on('stream', (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    });
}

getMediaStream().then(() => {
    setupPeer();

    const peerId = meetingId;

    if (peerId) {
        const remotePeerId = prompt("Enter the remote user's peer ID to connect:");
        if (remotePeerId) {
            call = peer.call(remotePeerId, localStream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
        }
    }
});

muteBtn.addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    muteBtn.textContent = audioTrack.enabled ? 'Mute' : 'Unmute';
});

stopVideoBtn.addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    stopVideoBtn.textContent = videoTrack.enabled ? 'Stop Video' : 'Start Video';
});

leaveBtn.addEventListener('click', () => {
    call.close();
    peer.destroy();
    window.location.href = 'index.html';
});
// Show Peer ID when peer connection is open
peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
    document.getElementById('peer-id').textContent = 'Your Peer ID: ' + id;
});
