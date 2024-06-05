let allDataMap = new Map(); // Use Map for better performance

// WebSocket setup
const socket = new WebSocket('wss://client-api-2-74b1891ee9f9.herokuapp.com/socket.io/?EIO=4&transport=websocket');
socket.onopen = function (event) {
    console.log('Connected to WebSocket');
    socket.send('40');
};

function convertToObject(response) {
    const i1 = response.indexOf('[');
    const i2 = response.indexOf('{');
    if (i1 === -1 || i2 < i1) { // it should look like this [... , {...}]
        return {
            eventName: 'error',
            data: {}
        };
    };
    const jsonResponse = response.substring(i1);
    const parsedResponse = JSON.parse(jsonResponse);

    const eventName = parsedResponse[0];
    const eventData = parsedResponse[1];

    // Return an object containing the event name and data
    return {
        eventName: eventName,
        data: eventData
    };
}

function fillAllDataMap(obj) {
    const data = convertToObject(obj);
    if (data.eventName === 'tradeCreated') {
        obj = {
            age: 0,
            overlap: 1,
            id: data.data.mint,
            value: data.data.market_cap,
            name: data.data.name,
            symbol: data.data.symbol,
            description: data.data.description,
            image_uri: data.data.image_uri
        };
    } else { return; }
    // Check if the object with the same id already exists in the pool
    let existingObj = allDataMap.get(obj.id);

    if (existingObj) {
        // If it exists, update its value and increment the overlap property
        existingObj.value = obj.value;
        existingObj.overlap += 1;
    } else {
        // If it does not exist, add it to the pool
        allDataMap.set(obj.id, { ...obj });
    }
}


socket.addEventListener('message', function (event) {
    if (event.data === "2") { socket.send("3") }
    else {
        fillAllDataMap(event.data);
    };
});


setInterval(() => {
    allDataMap.forEach(obj => {
        obj.age += 1;

        // Remove if age exceeds 60
        if (obj.age > 60) {
            allDataMap.delete(obj.id);
        }
    });
    console.log(allDataMap);
}, 3000);
