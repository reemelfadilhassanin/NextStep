// controllers/searchController.js
const axios = require('axios');
const Search = require('../models/searchModel');
const chalk = require('chalk');
const config = require('../config');

// Define supported countries (extend this list based on the countries Adzuna supports)
const supportedCountries = ['gb', 'us', 'ca', 'au'];  // Add more countries if needed
const defaultCountry = 'gb';  // Default to UK if the country is unsupported

// Helper function to log and handle errors
const handleError = (res, error, message = 'Internal Server Error') => {
  console.log(chalk.red(error));
  res.status(500).json({ error: message, details: error.message });
};

// Function to save search data to MongoDB
const saveSearchData = async (searchTerm, location, country, results) => {
  try {
    const search = new Search({
      searchTerm,
      location,
      country,
      resultsCount: results.length,
      results
    });
    await search.save();
    console.log(chalk.green(`Search data saved for: ${searchTerm}`));
  } catch (err) {
    console.log(chalk.red('Error saving search data:', err));
  }
};

// Function to perform the job search and return results
const searchJobs = async (req, res) => {
  const { search, location, country = 'gb' } = req.query;
  const fixedSearch = search?.replace('devoper', 'developer') || 'developer';
  const validCountry = supportedCountries.includes(country) ? country : defaultCountry;
  const targetLocation = location || '';
  
  // Construct the target URL for Adzuna API
  const targetURL = `${config.BASE_URL}/${validCountry}/search/1?&results_per_page=20&content-type=application/json&app_id=${config.APP_ID}&app_key=${config.API_KEY}&what=${encodeURIComponent(fixedSearch)}&where=${encodeURIComponent(targetLocation)}`;

  try {
    const response = await axios.get(targetURL);
    if (response.data && response.data.results && response.data.results.length > 0) {
      // Save search data to MongoDB
      await saveSearchData(fixedSearch, targetLocation, validCountry, response.data.results);
      
      // Return search results
      res.status(200).json(response.data);
    } else {
      // Fallback to UK if no results found
      console.log(chalk.yellow(`No results found for country: ${validCountry}. Attempting global search.`));
      const fallbackURL = `${config.BASE_URL}/gb/search/1?&results_per_page=20&content-type=application/json&app_id=${config.APP_ID}&app_key=${config.API_KEY}&what=${encodeURIComponent(fixedSearch)}&where=`;

      const fallbackResponse = await axios.get(fallbackURL);
      if (fallbackResponse.data && fallbackResponse.data.results && fallbackResponse.data.results.length > 0) {
        await saveSearchData(fixedSearch, targetLocation, 'gb', fallbackResponse.data.results);
        res.status(200).json(fallbackResponse.data);
      } else {
        res.status(404).json({ error: 'No results found globally' });
      }
    }
  } catch (err) {
    handleError(res, err, 'Error fetching job data');
  }
};

module.exports = { searchJobs };
