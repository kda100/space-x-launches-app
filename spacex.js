const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const asteroidClicks = {};

let muted = true;
const volumeButton = document.getElementById("volume");

volumeButton.addEventListener("click", function () {
    if (muted) {
        volumeButton.src = "assets/images/volume.png";
    } else {
        volumeButton.src = "assets/images/mute.png";
    }
    muted = !muted;
});

window.addEventListener("scroll", function () {
    if (!muted) {
        const buzzLightYear = document.getElementById("buzzlightyear");
        buzzLightYear.play();
    }
});

async function getSpaceXLaunchesData() {
    const launchProperties = ["name", "date_utc"];
    const rocketProperties = ["name", "flickr_images"];
    const launchPadProperties = ["locality", "images"];

    const launchesJson = await (await fetch("https://api.spacexdata.com/v5/launches/upcoming")).json();
    const launchesArr = [];
    for (let i = 0; i < launchesJson.length; i++) {
        const launchJson = launchesJson[i];
        const rocketJson = await (await fetch(`https://api.spacexdata.com/v4/rockets/${launchJson["rocket"]}`)).json();
        const launchPadJson = await (await fetch(`https://api.spacexdata.com/v4/launchpads/${launchJson["launchpad"]}`)).json();
        const newLaunch = {
            ...reduceObject(launchJson, launchProperties, "launch_"),
            ...reduceObject(rocketJson, rocketProperties, "rocket_"),
            ...reduceObject(launchPadJson, launchPadProperties, "launchpad_")
        };
        launchesArr.push(newLaunch);
    }
    return launchesArr;
}

function reduceObject(object, selectedProperties, prefix = "") {
    return selectedProperties.reduce(function (newObject, key) {
        if (key in object) {
            if (key === "date_utc") {
                newObject[prefix + key] = new Date(object[key]);
            } else {
                newObject[prefix + key] = object[key];
            }
        }
        return newObject;
    }, {});
}

function convertDateToString(date) {
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${date.toTimeString().split(" ")[0].substring(0, 5)} UTC`; //Tuesday February 12 2013
}

function createLaunchInfo(launchObject) {
    return `<div class="launch-inner-container">
                <h2>${launchObject.launch_name}</h2>
                <h3>${convertDateToString(launchObject.launch_date_utc)}</h3>
                <h3>Rocket - ${launchObject.rocket_name}</h3>
                <img src="${launchObject.rocket_flickr_images[0]}" alt="">
                <h3>Launch Pad - ${launchObject.launchpad_locality}</h3>
                <img src="${launchObject.launchpad_images.large}" alt="">
            </div>`
}

function createAsteroids() {
    let asteroids = ""
    for (let i = 0; i < 5; i++) {
        asteroids += `<div id="${"asteroid" + (i + 1)}" class="asteroid rotate">
        <img src="assets/images/asteroid.png" alt="">
    </div>`;
    }
    return asteroids
}

function playExplosion() {
    if (!muted) {
        const explosion = document.getElementById("explosion");
        explosion.currentTime = 0;
        explosion.play();
    }
}

function showMars() {
    let showMars = true;
    for (const asteroid in asteroidClicks) {
        if (asteroidClicks[asteroid] !== -1) {
            showMars = false;
        }
    }
    if (showMars) {
        const main = document.getElementsByTagName("main")[0];
        main.innerHTML += `<h2 class="asteroids-title">Welcome to Mars !!!</h2>
        <div class="asteroids"><div class="mars">
        <img src="assets/images/mars.png" alt=""></div></div>`;
    }
}

function onClickAsteroid(asteroid) {
    const id = asteroid.id;
    asteroidClicks[id]++;
    playExplosion();
    asteroid.style = `transform: rotate(${360 * asteroidClicks[id]}deg)`
    if (asteroidClicks[id] == 3) {
        asteroidClicks[id] = -1;
        asteroid.style.visibility = "hidden";
    }
    showMars();
}


function setUpAsteroidGame() {
    const asteroids = document.getElementsByClassName("asteroid");
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        asteroidClicks[asteroid.id] = 0;
        asteroid.addEventListener("click", function () {
            onClickAsteroid(asteroid)
        });
    }
}

getSpaceXLaunchesData().then(launchesArr => {
    const main = document.getElementsByTagName("main")[0];
    for (let i = 0; i < launchesArr.length; i += 2) {
        const launchObject1 = launchesArr[i];
        if (i < launchesArr.length - 1) {
            const launchObject2 = launchesArr[i + 1];
            main.innerHTML += `
        <section class="launch-outer-container">
            ${createLaunchInfo(launchObject1)}
            ${createLaunchInfo(launchObject2)}
        </section>`;
        } else {
            main.innerHTML += `<section class="launch-outer-container">
                ${createLaunchInfo(launchObject1)}
            </section>`
        }
    }
    main.innerHTML += `<h2 class="asteroids-title">Destroy the Asteroids to get to Mars !</h2><div class="asteroids">${createAsteroids()}</div>`;
    setUpAsteroidGame();
});