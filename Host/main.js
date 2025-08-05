(function () {
  // Define "global" variables

  var connectButton = null;
  var disconnectButton = null;
  var sendButton = null;
  var messageInputBox = null;
  var hostTokenBox = null;
  var localConnection = null; // RTCPeerConnection for our "local" connection

  var sendChannel = null; // RTCDataChannel for the local (sender)

  // Functions

  // Set things up, connect event listeners, etc.

  function startup() {
    connectButton = document.getElementById("connectButton");
    disconnectButton = document.getElementById("disconnectButton");
    sendButton = document.getElementById("sendButton");
    messageInputBox = document.getElementById("message");
    hostTokenBox = document.getElementById("hostToken");

    // Set event listeners for user interface widgets

    connectButton.addEventListener("click", connectPeers, false);
    disconnectButton.addEventListener("click", disconnectPeers, false);
    sendButton.addEventListener("click", sendMessage, false);
  }

  // Connect the two peers. Normally you look for and connect to a remote
  // machine here, but we're just connecting two local objects, so we can
  // bypass that step.

  function connectPeers() {
    // Create the local connection and its event listeners

    localConnection = new RTCPeerConnection();

    // Create the data channel and establish its event listeners
    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    // Now create an offer to connect; this starts the process

    localConnection
      .createOffer()
      .then((offer) => localConnection.setLocalDescription(offer))
      .then(() => {
        hostTokenBox.textContent = localConnection.localDescription.sdp;
        console.log(localConnection.localDescription);
      })
      .catch(handleCreateDescriptionError);
  }

  // Handle errors attempting to create a description;
  // this can happen both when creating an offer and when
  // creating an answer. In this simple example, we handle
  // both the same way.

  function handleCreateDescriptionError(error) {
    console.log("Unable to create an offer: " + error.toString());
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.

  function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);

    // Clear the input box and re-focus it, so that we're
    // ready for the next message.

    messageInputBox.value = "";
    messageInputBox.focus();
  }

  // Handle status changes on the local end of the data
  // channel; this is the end doing the sending of data
  // in this example.

  function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        sendButton.disabled = false;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
      } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
  }

  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.

  function disconnectPeers() {
    // Close the RTCDataChannels if they're open.

    sendChannel.close();

    // Close the RTCPeerConnections

    localConnection.close();

    sendChannel = null;
    localConnection = null;

    // Update user interface elements

    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendButton.disabled = true;

    messageInputBox.value = "";
    messageInputBox.disabled = true;
  }

  // Set up an event listener which will run the startup
  // function once the page is done loading.

  window.addEventListener("load", startup, false);
})();
