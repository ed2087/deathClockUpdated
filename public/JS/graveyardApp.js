console.log("graveyardApp.js");

let page = 1;
let limit = 10;

const liMold = (user) => {
    return `
        <li class="gaveyard_graves">
            <!-- image -->
            <img src="../../IMAGES/utils/Grave.webp" alt="grave" class="graveyard_grave" alt="tomb stone" onload="imageLoaded(this)">

            <!-- users info -->
            <div class="user_infowrap">
                <h3 class="userInfo_h3tag">${user.userName}</h3>
                <p class="userInfo_ptag"><span class="special_yellow_text">Yrs Left</span> <br> ${user.clock.yearsLeft}</p>
                <!-- link -->
                <a href="/deathClock/results/${user.userShortId}">More...</a>
            </div>
        </li>
    `;
};

// create a clone mold but for loading
const liMold_loading = () => `
    <li class="gaveyard_graves loading_mold">

        <!-- users info -->
        <div class="user_infowrap">
            <h3 class="userInfo_h3tag">
                <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </h3>
            <p class="userInfo_ptag"><span class="special_yellow_text">Yrs Left</span> <br> 
                <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            </p>
            <!-- link -->
            <a href=""><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></a> 
        </div>
    </li>
`;

const fetchGraveyards = async () => {
    const ULWrap = id_("graveyard_wrap");

    // Function to add loading molds
    const addLoadingMolds = () => {
        Array.from({ length: limit }, () => ULWrap.insertAdjacentHTML("beforeend", liMold_loading()));
    };

    // Function to wait for all images to load
    const waitForImagesToLoad = () => {
        return new Promise(resolve => {
            const images = document.querySelectorAll(".gaveyard_grave");
            let loadedCount = 0;

            const checkLoaded = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    resolve();
                }
            };

            images.forEach(image => {
                if (image.complete) {
                    checkLoaded();
                } else {
                    image.onload = checkLoaded;
                }
            });

            if (loadedCount === images.length) {
                resolve();
            }
        });
    };

    // Add loading molds
    addLoadingMolds();

    try {
        const res = await fetch(`/deathClock/pagination?page=${page}&limit=${limit}`);
        const data = await res.json();

        if (data.status === "ok") {
            // Remove all loading_mold
            document.querySelectorAll(".loading_mold").forEach(element => element.remove());

            // Wait for all images to load
            await waitForImagesToLoad();

            // Add users to the page
            data.data.forEach(user => ULWrap.insertAdjacentHTML("beforeend", liMold(user)));

            // Count .gaveyard_graves elements and set the display property for "loadMore"
            const gravesLength = document.querySelectorAll(".gaveyard_graves").length;
            id_("loadMore").style.display = gravesLength === data.data[0].available ? "none" : "block";
        }
    } catch (error) {
        console.log(error);
    }
};


const loadMoreGraves = () => {
    page++;
    fetchGraveyards();
};

id_("loadMore").addEventListener("click", loadMoreGraves);

window.onload = fetchGraveyards;
