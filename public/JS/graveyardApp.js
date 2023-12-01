console.log("graveyardApp.js");

let page = 1;
let limit = 10;
let availableClocks = 0;

const liMold = (user) => {
    return `
        <li class="gaveyard_graves">
            <!-- image -->
            <img src="../../IMAGES/utils/Grave.webp" alt="grave" class="graveyard_grave" alt="tomb stone">

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

    // add loading
    Array.from({ length: limit }, () => ULWrap.insertAdjacentHTML("beforeend", liMold_loading()));

    try {
        const res = await fetch(`/deathClock/pagination?page=${page}&limit=${limit}`);
        const data = await res.json();

        if (data.status === "ok") {
            // remove all loading_mold
            document.querySelectorAll(".loading_mold").forEach(element => element.remove());

            // add users to the page
            data.data.forEach(user => ULWrap.insertAdjacentHTML("beforeend", liMold(user)));

            // count .gaveyard_graves elements and see if they are equal to totalClocks_available 
            const gravesLength = document.querySelectorAll(".gaveyard_graves").length;

            id_("loadMore").style.display = gravesLength === data.totalClocks_avalable ? "none" : "block";

            availableClocks = data.totalClocks_avalable;
        }
    } catch (error) {
        console.log(error);
    }
}


const loadMoreGraves = () => {
    page++;
    fetchGraveyards();    
};

id_("loadMore").addEventListener("click", loadMoreGraves);

fetchGraveyards();
updateClock();


// create a timer that will update the clock every 30 seconds to check if there is a new clock
function updateClock () {
    console.log(availableClocks, "availableClocks");
};


