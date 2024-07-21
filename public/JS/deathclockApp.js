// Template function for creating explain cards
const explainCardsTemplate = (title, content) => {
  return `
    <li class="explain_cards">
      <h3 class="explainded_h3">${title}:</h3>
      <p class="explainded_p">
          ${content}
      </p>
    </li>
  `;
};

// Function to add explanation cards to the DOM
const addExplanationCards = (explanations) => {
  const cardsWrap = document.getElementById('cards__wrap_explain');
  explanations.forEach(explanation => {
    const cardHTML = explainCardsTemplate(explanation.title, explanation.content);
    cardsWrap.insertAdjacentHTML('beforeend', cardHTML);
  });
};

const userJson = JSON.parse(user.jsonFile);
let explanationsAdded = false;

function formatNumberWithCommas(number) {
  return number.toLocaleString();
}

// Function to update the display and populate explanation cards
function updateDisplay() {
  const now = Date.now();
  const deathDate = new Date(userJson.death_prediction.predicted_date_of_death).getTime();
  const millisecondsLeft = deathDate - now;

  // Calculate the remaining time
  const yearsLeft = Math.floor(millisecondsLeft / (1000 * 60 * 60 * 24 * 365));
  const monthsLeft = Math.floor(millisecondsLeft / (1000 * 60 * 60 * 24 * 30.44));
  const weeksLeft = Math.floor(millisecondsLeft / (1000 * 60 * 60 * 24 * 7));
  const daysLeft = Math.floor(millisecondsLeft / (1000 * 60 * 60 * 24));
  const totalHoursLeft = Math.floor(millisecondsLeft / (1000 * 60 * 60));
  const totalMinutesLeft = Math.floor(millisecondsLeft / (1000 * 60));
  const totalSecondsLeft = Math.floor(millisecondsLeft / 1000);

  document.getElementById('yearsLeft').textContent = formatNumberWithCommas(yearsLeft);
  document.getElementById('monthsLeft').textContent = formatNumberWithCommas(monthsLeft);
  document.getElementById('weeksLeft').textContent = formatNumberWithCommas(weeksLeft);
  document.getElementById('daysLeft').textContent = formatNumberWithCommas(daysLeft);
  document.getElementById('hrsLeft').textContent = formatNumberWithCommas(totalHoursLeft);
  document.getElementById('minLeft').textContent = formatNumberWithCommas(totalMinutesLeft);
  document.getElementById('secLeft').textContent = formatNumberWithCommas(totalSecondsLeft);

  // Update death date
  const deathDateFormatted = new Date(deathDate).toLocaleDateString();
  document.getElementById('deathYear').textContent = deathDateFormatted;

  // Update lived time


  const { years_lived, months_lived, weeks_lived, days_lived, hours_lived, minutes_lived, seconds_lived } = userJson.you_have_lived;
  
 
  const birthDate = new Date(user.birthdate).getTime();
  const millisecondsLived = now - birthDate;

  const yearsLived = Math.floor(millisecondsLived / (1000 * 60 * 60 * 24 * 365));
  const monthsLived = Math.floor(millisecondsLived / (1000 * 60 * 60 * 24 * 30.44));
  const weeksLived = Math.floor(millisecondsLived / (1000 * 60 * 60 * 24 * 7));
  const daysLived = Math.floor(millisecondsLived / (1000 * 60 * 60 * 24));
  const totalHoursLived = Math.floor(millisecondsLived / (1000 * 60 * 60));
  const totalMinutesLived = Math.floor(millisecondsLived / (1000 * 60));
  const totalSecondsLived = Math.floor(millisecondsLived / 1000);

  document.getElementById('yearsLived').textContent = formatNumberWithCommas(yearsLived);
  document.getElementById('monthsLived').textContent = formatNumberWithCommas(monthsLived);
  document.getElementById('weeksLived').textContent = formatNumberWithCommas(weeksLived);
  document.getElementById('daysLived').textContent = formatNumberWithCommas(daysLived);
  document.getElementById('hrsLived').textContent = formatNumberWithCommas(totalHoursLived);
  document.getElementById('minLived').textContent = formatNumberWithCommas(totalMinutesLived);
  document.getElementById('secLived').textContent = formatNumberWithCommas(totalSecondsLived);

  if (!explanationsAdded) {
    // Prepare explanations
    const detailedExplanation = userJson.explanation || userJson.detailed_explanation;
    const explanations = Object.keys(detailedExplanation).map(key => ({
      title: detailedExplanation[key].title || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace("Detail", ""),
      content: detailedExplanation[key].message || detailedExplanation[key].detail || detailedExplanation[key]
    }));
  
    // Add the explanation cards to the DOM
    addExplanationCards(explanations);
    explanationsAdded = true;
  }
  
}

function startChart(data) {
  const ctx = document.getElementById("chart").getContext("2d");

  const userPredictedDeathYear = new Date(userJson.death_prediction.predicted_date_of_death).getFullYear();

  const years = [...new Set([...data.years, userPredictedDeathYear])].sort((a, b) => a - b);
  const counts = years.map(year => data.years.includes(year) ? data.counts[data.years.indexOf(year)] : 0);
  const userCounts = years.map(year => (year === userPredictedDeathYear ? 1 : 0));

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years, // Labels based on the years of predicted death including the user's year
      datasets: [
        {
          label: "Average Death Predictions",
          data: counts, // Counts of users dying in those years
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          pointBackgroundColor: "#4CAF50",
        },
        {
          label: "Your Predicted Death Year",
          data: userCounts,
          borderColor: "rgba(255, 99, 132, 0.6)",
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          pointBackgroundColor: "rgba(255, 99, 132, 0.6)",
          pointRadius: years.map(year => (year === userPredictedDeathYear ? 5 : 0)),
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Users' Death Clock Predictions",
          color: "#FFF",
        },
        legend: {
          labels: {
            color: "#FFF",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#FFF",
          },
        },
        y: {
          ticks: {
            color: "#FFF",
          },
        },
      },
    }
  });

  chart.update();

  // remove gridLoading
  document.getElementById('gridLoading').remove();
}

window.onload = function() {
  updateDisplay();
  setInterval(updateDisplay, 1000);

  const yearCounts = predictedDeathYears.reduce((acc, year) => {
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const data = {
    years: Object.keys(yearCounts).map(Number).sort((a, b) => a - b),
    counts: Object.values(yearCounts)
  };

  startChart(data);
};
