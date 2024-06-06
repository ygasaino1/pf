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
    const parsed = convertToObject(obj);
    if (parsed.eventName === 'tradeCreated') {
        obj = {
            age: 0,
            trades: 1,
            offset: 0,
            // value: data.data.market_cap,
            value: parsed.data.usd_market_cap,
            valueDiff: 0,
            valueOld: 0,
            id: parsed.data.mint,
            name: parsed.data.name,
            symbol: parsed.data.symbol,
            description: parsed.data.description,
            image_uri: parsed.data.image_uri,
            is_buy: parsed.data.is_buy,
            created: parsed.data.created_timestamp
        };
    } else { return; }
    // Check if the object with the same id already exists in the pool
    let existingObj = allDataMap.get(obj.id);

    if (existingObj) {
        // If it exists, update its value and increment the overlap property
        existingObj.value = obj.value;
        existingObj.trades += 1;
        existingObj.age = 0;
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
    let now = Date.now();

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


    //////////////////////////////////////////////////////////////////////////////////////ERROR IS HERE//////////////////////
    // Clear and re-add rows in sorted order to the DOM
    const currentIds = new Set(topData.map(item => item.id));
    rows.forEach(row => {
        if (!currentIds.has(row.id)) {
            row.remove();
        }
    });


    let newPositions = [];
    // container.innerHTML = '';

    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    topData.forEach(item => {
        let row = document.getElementById(item.id);
        if (row) {
            // row.style.transition = 'none';
            row.innerHTML = `<div>${item.symbol + ' [' + toDate(now - item.created) + '][' + item.trades + '₪]'}</div><div>${toK(item.value)}</div>`;
            container.appendChild(row);
        } else {
            row = document.createElement('a');
            row.target = "_blank";
            row.href = `https://pump.fun/${item.id}`;
            // row.style.transition = 'none';
            row.className = 'row';
            row.id = item.id;
            row.innerHTML = `<div>${item.symbol}</div><div>${toK(item.value)}</div>`;

            container.appendChild(row); // Add new rows to the bottom
        }
    });
    topData.forEach(item => {

        let row = document.getElementById(item.id);

        let newPos = row.getBoundingClientRect().top - containerTop;
        let oldPos = oldPositions.find(pos => pos.id === item.id);
        if (oldPos) { oldPos = oldPos.top; } else { oldPos = newPos; }
        // console.log(oldPos, ' | ', newPos);
        item.offset = oldPos - newPos;

    });




    // Update content and apply background color animation
    topData.forEach(item => {
        const row = document.getElementById(item.id);
        row.style.transition = 'none';

        if (item.valueDiff > 0) { //newValue < oldValue
            row.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Red
        } else if (item.valueDiff < 0) { //newValue < oldValue
            row.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        }

        if (item.offset !== 0) {
            // console.log(item, row);
            row.style.transform = `translateY(${item.offset}px)`;
        }
    });


    requestAnimationFrame(() => {

        topData.forEach(item => {
            const row = document.getElementById(item.id);
            if (row) {
                row.offsetHeight;

                row.style.transition = 'transform 0.5s, background-color 3s ease-out';
                row.style.backgroundColor = 'var(--bg-color)';
                row.style.transform = 'translateY(0px)';
            }
        })
    });
}

let debug = false;
setInterval(() => {
    if (debug) { return; }
    allDataMap.forEach(obj => {
        obj.age += 1;
        obj.valueDiff = obj.value - obj.valueOld;
        //console.log(obj.value, obj.valueOld);
        obj.valueOld = obj.value;

        // Remove if age exceeds 60
        if (obj.age > 10) {
            allDataMap.delete(obj.id);
        }
    });
    // console.log(allDataMap);
    updateRows(allDataMap);
}, 3000);


function toK(number) {
    if (number >= 1000000) {
        // Format number for millions
        return (number / 1000000).toFixed(1) + 'M';
    } else {
        // Format number less than 1000 in thousands
        return (number / 1000).toFixed(1) + 'k';
    }
}

function toDate(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
        return days + 'd';
    } else if (hours >= 1) {
        return hours + 'h';
    } else if (minutes >= 1) {
        return minutes + 'm';
    } else {
        return seconds + 's';
    }
}