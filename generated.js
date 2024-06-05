let allData = [];
let wssPool = [];

function fillAllDataMap(obj) {
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

setInterval(() => {
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
