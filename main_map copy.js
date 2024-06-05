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
            offset: 0,
            value: data.data.market_cap,
            valueDiff: 0,
            valueOld: 0,
            id: data.data.mint,
            name: data.data.name,
            symbol: data.data.symbol,
            description: data.data.description,
            image_uri: data.data.image_uri,
            is_buy: data.data.is_buy
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


// Function to render rows
// function renderRows(data) {
//     const container = document.getElementById('container');
//     container.innerHTML = '';

//     data.forEach(item => {
//         const row = document.createElement('div');
//         row.className = 'row';
//         row.id = item.id;
//         row.setAttribute('data-value', item.value);
//         row.innerHTML = `<div>${item.symbol}</div><div>${item.value}</div>`;
//         container.appendChild(row);
//     });
// }

// renderRows([...allDataMap.values()].slice(0, 50));

// Function to update and animate rows
function updateRows(allData) {
    // Sort data by value
    const topData = [...allData.values()].sort((a, b) => b.value - a.value).slice(0, 50);

    const container = document.getElementById('container');
    const rows = [...container.children];
    const containerTop = container.getBoundingClientRect().top;

    // Get current positions of all rows relative to the container
    const oldPositions = rows.map(row => ({
        id: row.id,
        top: row.getBoundingClientRect().top - containerTop
    }));

    // Clear and re-add rows in sorted order to the DOM
    // const currentIds = new Set(topData.map(item => item.id));
    // rows.forEach(row => {
    //     const rowId = row.id;
    //     if (!currentIds.has(rowId)) {
    //         row.remove();
    //     }
    // });

    let newPositions = [];
    container.innerHTML = '';
    topData.forEach(item => {
        const newRow = document.createElement('div');
        newRow.className = 'row';
        newRow.id = item.id;

        // let oldValue = newRow.getAttribute('value');
        // if (!oldValue) { oldValue = 0; }
        // newRow.setAttribute('value', item.value);
        // if (item.is_buy === true) {
        //     newRow.setAttribute('is_buy', 1);
        // } else { newRow.setAttribute('is_buy', -1); }


        newRow.innerHTML = `<div>${item.symbol}</div><div>${item.value}</div>`;
        container.appendChild(newRow); // Add new rows to the bottom

        let newPos = newRow.getBoundingClientRect().top - containerTop;
        let oldPos = oldPositions.find(pos => pos.id === item.id);
        if (oldPos) { oldPos = oldPos.top; } else { oldPos = newPos; }
        item.offset = oldPos - newPos;
    });







    // Update content and apply background color animation
    topData.forEach(item => {
        const row = document.getElementById(item.id);
        row.style.transition = 'none';

        // if (item.is_buy === true) { //newValue > oldValue
        //     allDataMap.get(item.id).is_buy = null;
        //     row.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Green
        // } else if (item.is_buy === false) { //newValue < oldValue
        //     allDataMap.get(item.id).is_buy = null;
        //     row.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Red
        // } else if (item.is_buy === null) { //newValue < oldValue
        //     row.style.backgroundColor = 'transparent';
        // }


        if (item.valueDiff > 0) { //newValue < oldValue
            row.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Red
        } else if (item.valueDiff < 0) { //newValue < oldValue
            row.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        }




        // let op = oldPositions.find(pos => pos.id === item.id);
        // let np = newPositions.find(pos => pos.id === item.id);
        // if (op && np) {
        //     const offset = op.top - np.top;
        //     console.log(offset);
        //     if (offset !== 0) { row.style.transform = `translateY(${offset}px)`; }

        // }

        if (item.offset !== 0) {
            // console.log(item, row);
            row.style.transform = `translateY(${item.offset}px)`;
        }

        // requestAnimationFrame(() => {
        // });
    });


    requestAnimationFrame(() => {

        topData.forEach(item => {
            const row = document.getElementById(item.id);
            row.offsetHeight;

            row.style.transition = 'transform 0.5s, background-color 2s ease-out';
            row.style.backgroundColor = 'transparent';
            row.style.transform = 'translateY(0px)';
        })
    });
}

let debug = false;
setInterval(() => {
    if (debug) { return; }
    allDataMap.forEach(obj => {
        obj.age += 1;
        obj.valueDiff = obj.value - obj.valueOld;
        console.log(obj.value, obj.valueOld);
        obj.valueOld = obj.value;

        // Remove if age exceeds 60
        if (obj.age > 60) {
            allDataMap.delete(obj.id);
        }
    });
    // console.log(allDataMap);
    updateRows(allDataMap);
}, 1000);
