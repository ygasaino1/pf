let allData = [];

// i have a websocket connection
// wss: -> it recieves lots of objects in this pattern
let objTemplate = {
    age:0,
    overlap:0,
    id:'1231231aasd23',
    value: 123
}

let wssPool = [];
// i want that connection start filling this wssPool using the fillWssPool(obj) function
// if our pool has an incoming obj with id that we already have then it needs:
// 1. update the value of the obj in the pool using the incoming obj's value
// 2. add +1 to the obj with same id in the pool's overlap propertie

function fillAllDataMap(obj)
{
    // GENERATE HERE
}

// then i have this interval of 3secs that going to happen for ever
// i want this interval to grab wssPool content and fill the allData variable with almost similar rules as before:
// if our allData has an incoming obj with id that we already have then it needs:
// 1. update the value of the obj in the allData using the incoming obj's value
// 2. add +1 to the obj with same id in the allData's obj's overlap propertie
// in addition, on each interval:
// it needs to add +1 to the age of allData object's age value
// if an obj's age go beyonds 60, it should get deleted
setInterval(() => {

    // GENERATE HERE

},3000);
