// This module provides utility functions for simulating dynamic data.

export { getSimulatedWeather, getSimulatedMarketPrices, getSimulatedCropAdvisory };

function getSimulatedWeather(region) {
    const temperatures = {
        "Punjab": "28°C", "Haryana": "30°C", "UP": "31°C", "MP": "29°C",
        "Rajasthan": "35°C", "Maharashtra": "27°C", "Gujarat": "32°C"
    };
    const conditions = ["Sunny", "Partly Cloudy", "Light Rain"];
    const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = temperatures[region] || "29°C";
    return {
        temperature: temp,
        condition: currentCondition,
        humidity: `${Math.floor(Math.random() * 30) + 60}%`,
        wind: `${Math.floor(Math.random() * 10) + 5} km/h`
    };
}

function getSimulatedMarketPrices(cropType) {
    const prices = {
        "Rice": { min: 2000, max: 2500, unit: "₹/quintal" },
        "Wheat": { min: 2200, max: 2800, unit: "₹/quintal" },
        "Cotton": { min: 6000, max: 7000, unit: "₹/quintal" },
        "Sugarcane": { min: 300, max: 350, unit: "₹/quintal" }
    };
    const price = prices[cropType];
    if (price) {
        const current = Math.floor(Math.random() * (price.max - price.min + 1)) + price.min;
        return `${current} ${price.unit}`;
    }
    return "N/A";
}

function getSimulatedCropAdvisory(cropName, growthStage, observedPest) {
    let advisory = `General advisory for ${cropName}: `;
    switch (cropName) {
        case "Rice":
            advisory += `Maintain optimal water levels. `;
            if (growthStage.toLowerCase().includes('flowering')) advisory += `Ensure good pollination and monitor for panicle blast. `;
            if (observedPest.toLowerCase().includes('stem borer')) advisory += `Consider pheromone traps or appropriate insecticides.`;
            else advisory += `Regularly scout for common pests.`;
            break;
        case "Wheat":
            advisory += `Ensure proper nutrient supply, especially nitrogen. `;
            if (growthStage.toLowerCase().includes('tillering')) advisory += `Focus on weed management. `;
            if (observedPest.toLowerCase().includes('aphids')) advisory += `Apply systemic insecticides if infestation is severe.`;
            else advisory += `Keep an eye on rust diseases.`;
            break;
        case "Cotton":
            advisory += `Provide adequate sunlight and well-drained soil. `;
            if (growthStage.toLowerCase().includes('boll formation')) advisory += `Monitor for bollworm and whitefly. `;
            if (observedPest.toLowerCase().includes('bollworm')) advisory += `Use biological controls or targeted sprays.`;
            else advisory += `Apply regular irrigation during dry spells.`;
            break;
        default:
            advisory += `No specific advisory available for this crop yet. Please consult local agricultural extension services.`;
    }
    return advisory;
}
