// Dynamically import the socket.io client library
import('https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.3.2/socket.io.min.js').then(io => {
    // Now you can use the `io` object to create a socket connection
    const socket = io.default("wss://client-api-2-74b1891ee9f9.herokuapp.com");

    // Define a message queue
    const messageQueue = [];
    const batchSize = 5; // Adjust the batch size as needed

    // Socket.io 'message' event handler
    socket.on("message", async function (data) {
        // Handle your message here
        if (data === "2") { 
            socket.emit("message", "3");
        } else {
            // Enqueue the message into the message queue
            messageQueue.push(data);

            // If the batch size is reached, process the message queue
            if (messageQueue.length >= batchSize) {
                await processQueue();
            }
        }
    });

    // Asynchronous batch message processing function
    async function processQueue() {
        // Copy the current message queue for processing
        const batch = messageQueue.slice();
        
        // Clear the original message queue
        messageQueue.length = 0;

        // Process the batch of messages (replace this with your actual processing logic)
        console.log('Processing batch:', batch);

        // Simulate asynchronous processing with a delay
        await simulateProcessing();
    }

    // Simulated asynchronous processing function
    function simulateProcessing() {
        return new Promise(resolve => {
            // Simulate processing time (e.g., 500 milliseconds)
            console.log("done");
            setTimeout(resolve, 500);
        });
    }
});
