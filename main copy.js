document.addEventListener('DOMContentLoaded', () => {
    const parentElement = document.getElementById('JCool');
    let allData = {}

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

    let wssPool = {};
    function fillWssPool(obj) {
        if (obj.id in wssPool) {
            wssPool[obj.id].value = obj.value;
            wssPool[obj.id].overlap += 1;
        } else {
            wssPool[obj.id] = obj;
        }
    }

    socket.addEventListener('message', function (event) {
        if (event.data === "2") { socket.send("3") }
        else {
            const data = convertToObject(event.data);
            if (data.eventName === 'tradeCreated') {
                const newObject = {
                    age: 0,
                    overlap: 1,
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
        // console.log('beep');

        // for (let prop in wssPool) {
        //     if (prop in allData) { // prop is id in this object
        //         allData[prop].value = wssPool[prop].value;
        //         allData[prop].overlap += wssPool[prop].overlap;
        //     } else {
        //         allData[prop] = wssPool[prop];
        //     }
        // }

        // for (let prop in allData) {
        //     allData[prop].age += 1;
        //     if (allData[prop].age > 60) { delete allData[prop]; }
        // }

        // wssPool = {};

        // console.log(allData);
    }, 3000);
});
