document.addEventListener('DOMContentLoaded', () => {
    const parentElement = document.getElementById('JCool');
    let allData = []

    // WebSocket setup
    const socket = new WebSocket('wss://client-api-2-74b1891ee9f9.herokuapp.com/socket.io/?EIO=4&transport=websocket');
    socket.onopen = function (event) {
        console.log('Connected to WebSocket');
        socket.send('40');
    };

    function convertToObject(response) {
        // Extract the JSON part from the response string
        const jsonResponse = response.substring(response.indexOf('['));

        // Parse the JSON string to an object
        const parsedResponse = JSON.parse(jsonResponse);

        // Extract the event name and data object
        const eventName = parsedResponse[0];
        const eventData = parsedResponse[1];

        // Return an object containing the event name and data
        return {
            eventName: eventName,
            data: eventData
        };
    }

    let wssPool = [];
    function fillWssPool(obj) {
        // Check if the object with the same id already exists in the pool
        let existingObj = wssPool.find(item => item.id === obj.id);

        if (existingObj) {
            // If it exists, update its value and increment the overlap property
            existingObj.value = obj.value;
            existingObj.overlap += 1;
        } else {
            // If it does not exist, add it to the pool
            wssPool.push({ ...obj });
        }
    }

    socket.addEventListener('message', function (event) {
        if (event.data === "2") { socket.send("3") }
        else {
            const data = convertToObject(event.data);
            if (data.eventName === 'tradeCreated') {
                const newObject = {
                    age: 0,
                    overlap: 0,
                    id: data.data.mint,
                    value: data.data.market_cap,
                    name: data.data.name,
                    symbol: data.data.symbol,
                    description: data.data.description,
                    image_uri: data.data.image_uri
                };
                fillWssPool(newObject);
            }
        };
    });

    setInterval(() => {
        console.log('beep');
        wssPool.forEach(obj => {
            // Check if the object with the same id already exists in allData
            let existingObj = allData.find(item => item.id === obj.id);

            if (existingObj) {
                // If it exists, update its value and increment the overlap property
                existingObj.value = obj.value;
                existingObj.overlap += 1;
            } else {
                // If it does not exist, add it to allData
                allData.push({ ...obj });
            }
        });

        // Increment the age of all objects in allData
        allData.forEach((item, index) => {
            item.age += 1;

            // Remove the object if its age exceeds 60
            if (item.age > 60) {
                allData.splice(index, 1);
            }
        });

        // Clear wssPool after processing
        wssPool = [];
    }, 3000);
});
