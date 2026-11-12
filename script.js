const bookingTabs = document.querySelectorAll("[data-booking-tab]");
const flightPanel = document.querySelector("#flight-panel");
const busPanel = document.querySelector("#bus-panel");

bookingTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const showFlights = tab.dataset.bookingTab === "flight";

    flightPanel.hidden = !showFlights;
    busPanel.hidden = showFlights;

    bookingTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("active", isSelected);
      item.setAttribute("aria-selected", isSelected);
    });
  });
});

const tripSummary = document.querySelector("#trip-summary");
const tripFare = document.querySelector("#trip-fare");
const bookingMessage = document.querySelector("#booking-message");

const pakistanCities = [
  "Lahore",
  "Islamabad",
  "Karachi",
  "Peshawar",
  "Sialkot"
];

let selectedTrip = null;

function showTrip(type, details, fare) {
  selectedTrip = {
    type,
    details,
    fare
  };

  tripSummary.textContent = details;
  tripFare.textContent = `Rs. ${fare.toLocaleString()}`;
  bookingMessage.textContent = "";

  document.querySelector("#booking-summary").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

const tripTypeSelect = document.querySelector("#flight-trip-type");
const returnDateField = document.querySelector("#return-date-field");
const returnDateInput = document.querySelector("#flight-return-date");
const departureDateInput = document.querySelector("#flight-date");

function updateReturnDateField() {
  const isRoundTrip = tripTypeSelect.value === "round-trip";

  returnDateField.hidden = !isRoundTrip;
  returnDateInput.required = isRoundTrip;
  returnDateInput.min = departureDateInput.value;

  if (!isRoundTrip) {
    returnDateInput.value = "";
  }
}

tripTypeSelect.addEventListener("change", updateReturnDateField);

departureDateInput.addEventListener("change", () => {
  returnDateInput.min = departureDateInput.value;

  if (returnDateInput.value && returnDateInput.value < departureDateInput.value) {
    returnDateInput.value = "";
  }
});

updateReturnDateField();

document.querySelector("#flight-search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  selectedTrip = null;

  const direction = document.querySelector("#flight-direction").value;
  const from = document.querySelector("#flight-from").value;
  const to = document.querySelector("#flight-to").value;
  const date = departureDateInput.value;
  const returnDate = returnDateInput.value;
  const tripType = tripTypeSelect.value;
  const passengers = Number(document.querySelector("#flight-passengers").value);
  const travelClass = document.querySelector("#flight-class").value;

  const fromIsPakistan = pakistanCities.includes(from);
  const toIsPakistan = pakistanCities.includes(to);

  if (direction === "from-pakistan" && (!fromIsPakistan || toIsPakistan)) {
    tripSummary.textContent =
      "For this direction, choose a Pakistan city in From and another country in To.";
    return;
  }

  if (direction === "to-pakistan" && (fromIsPakistan || !toIsPakistan)) {
    tripSummary.textContent =
      "For this direction, choose another country in From and a Pakistan city in To.";
    return;
  }

  if (from === to) {
    tripSummary.textContent =
      "Please choose different departure and destination locations.";
    return;
  }

  if (tripType === "round-trip" && returnDate < date) {
    tripSummary.textContent =
      "Return date should be the same as or later than the departure date.";
    return;
  }

  const baseFare = 120000;
  const classMultiplier = travelClass === "business" ? 2.4 : 1;
  const tripMultiplier = tripType === "round-trip" ? 2 : 1;
  const fare = Math.round(
    baseFare * classMultiplier * tripMultiplier * passengers
  );

  const journeyType = tripType === "round-trip" ? "Round-trip" : "One-way";
  const returnText =
    tripType === "round-trip" ? ` Returning on ${returnDate}.` : "";

  showTrip(
    "Flight",
    `${journeyType}: ${from} to ${to} on ${date}.${returnText} ${passengers} passenger(s), ${travelClass} class. This is an estimate, not a live airline fare.`,
    fare
  );
});

const busFares = {
  "Lahore to Faisalabad": 1800,
  "Lahore to Sialkot": 2000,
  "Lahore to Multan": 2800,
  "Islamabad to Lahore": 3200,
  "Lahore to Swat": 5200,
  "Lahore to Murree": 4200,
  "Islamabad to Swat": 2800,
  "Karachi to Hyderabad": 1600,
  "Lahore to Karachi": 6500,
  "Islamabad to Peshawar": 1800
};

document.querySelector("#bus-search-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const route = document.querySelector("#bus-route").value;
  const date = document.querySelector("#bus-date").value;
  const passengers = Number(document.querySelector("#bus-passengers").value);
  const seatType = document.querySelector("#bus-class").value;

  let seatMultiplier = 1;

  if (seatType === "executive") {
    seatMultiplier = 1.35;
  } else if (seatType === "business") {
    seatMultiplier = 1.7;
  }

  const fare = Math.round(busFares[route] * seatMultiplier * passengers);

  showTrip(
    "Bus",
    `Bus estimate: ${route} on ${date}. ${passengers} passenger(s), ${seatType} seat. This is an estimate; availability is not live.`,
    fare
  );
});

document.querySelector("#payment-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedTrip) {
    bookingMessage.textContent = "Please search and select a flight or bus route first.";
    document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const customerName = document.querySelector("#traveler-name").value.trim();
  const paymentSelect = document.querySelector("#payment-method");
  const paymentMethod =
    paymentSelect.options[paymentSelect.selectedIndex].text;

  bookingMessage.textContent =
    `Thank you, ${customerName}. Your demo ${selectedTrip.type.toLowerCase()} booking is confirmed. ` +
    `Estimated fare: Rs. ${selectedTrip.fare.toLocaleString()}. ` +
    `Selected method: ${paymentMethod}. No payment was charged.`;
});